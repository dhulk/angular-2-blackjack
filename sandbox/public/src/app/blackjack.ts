import * as _ from 'lodash';
import {Component} from '@angular/core';
import {MatSnackBar} from '@angular/material';
import {DeckService} from './cards/deck.service';

@Component({
	selector: 'blackjack',
	template: `	<div class="card-table">
					<span class="display-points">Winnings: {{winnings}}$ (*** HiLo: {{gameDeck.getHiLo()}} ***)</span>
					<span class="display-points" [hidden]="dealerPoints.length === 0 || hideDealerPoints">Dealer: {{displayPoints(dealerPoints)}}</span>
					<div class="card-row">
						<playing-card *ngFor='let card of dealerCards' [card]="card" ></playing-card>
						<playing-card [card]="gameDeck.peekTopCard()"></playing-card>
					</div>
					<span class="display-points" [hidden]="playerPoints.length === 0" >Player: {{displayPoints(playerPoints)}}</span>
					<div class="card-row">
						<playing-card *ngFor='let card of playerCards' [card]="card" ></playing-card>
					</div>
					<div class="player-controls">
						<button mat-flat-button (click)="deal()" *ngIf="pot === null" href="#">Deal</button>
						<button mat-flat-button (click)="hitPlayer()" *ngIf="pot !== null" href="#">Hit</button>
						<button mat-flat-button (click)="playerDoubleDown()" *ngIf="pot !== null && playerCards.length === 2" href="#">Double Down</button>
						<button mat-flat-button (click)="stand()" *ngIf="pot !== null" href="#">Stand</button>
					</div>
				</div>`
})
export class Blackjack {

	winnings = 100;

	gameDeck = new DeckService( false );

	dealerCards = [];
	playerCards = [];

	hideDealerPoints = true;
	dealerPoints = [];
	playerPoints = [];

	dealerBusted = false;
	playerBusted = false;

	pot = null;

	_snackBar = null;

	constructor ( snackBar: MatSnackBar ) {

		this._snackBar = snackBar;

		//Startup
		this.gameDeck.shuffle();
	}

	openSnackBar(message) {
	    this._snackBar.open(message, '', {
	      duration: 2000,
	    });
	    //this.MatSnackBar.open(message, 'OK', this.snackConfig);
	  }

	scorePoints( currPoints, card ) {

		currPoints.push( this.gameDeck.getBlackjackScore( card ) );
	}

	calcPoints( points ) {

		var stdPoints = 0;
		var lowAcePoints = 0;

		_.each( points, ( points ) => {

			stdPoints += points[0];

			if ( points.length > 1 ) {
				lowAcePoints += points[1];
			}
			else {
				lowAcePoints += points[0];
			}
		});

		return [ stdPoints, lowAcePoints ];
	}

	displayPoints( points ) {

		var totalPoints = this.calcPoints( points );
		var stdPoints = totalPoints[0];
		var lowAcePoints = totalPoints[1];
		var orPoints = '';

		if ( stdPoints !== lowAcePoints ) {
			orPoints = ' or ' + lowAcePoints;
		}

		return stdPoints + orPoints;
	}

	reShuffle() {
		this.openSnackBar('Re-shuffling...');
		this.gameDeck.shuffle();
		return this.gameDeck.dealCard();
	}

	placeBet( stake ) {

		if ( _.isNil( stake ) ) {
			stake = 10;
		}
		this.pot += stake * 2;
		this.winnings -= stake;
	}

	deal() {

		//Make 10$ bet for player reset at zero
		if ( this.winnings === 0 ) {
			this.winnings = 100;
		}

		//Reset bet
		this.placeBet( null );

		for ( var i = 1; i <= 4; i++ ) {

			var currCard = this.gameDeck.dealCard();
			if ( _.isNil( currCard ) ) {
				currCard = this.reShuffle();
			}

			if ( i % 2 == 0 ) {
				//Deal player card

				//Player cards always visible
				currCard.faceUp = true;

				//Score all player cards
				this.scorePoints( this.playerPoints, currCard );

				this.playerCards.push( currCard );
			}
			else {
				//Dealer

				if ( i === 1 ) {
					currCard.faceUp = true;
				}

				//Score dealer
				this.scorePoints( this.dealerPoints, currCard );

				this.dealerCards.push( currCard );
			}
		}

		this.checkBustBlackjack( this.playerPoints, false );
		//Also check for dealer blackjack
		if ( this.checkBustBlackjack( this.dealerPoints, true ) ) {
			//Dealer Wins ( or a double blackjack push )
		}
	}

	checkBustBlackjack( points, isDealer ) {

		//Look for bust / blackjack
		var currPoints = this.calcPoints( points );

		if ( currPoints[0] > 21 && currPoints[1] > 21) {

			if ( isDealer ) {
				this.dealerBusted = true;
				this.openSnackBar('Dealer BUST');
			}
			else {
				this.playerBusted = true;
				this.openSnackBar('Player BUST');
			}

			this.reset();

			return true;
		}
		else if ( currPoints[0] === 21 || currPoints[1] === 21) {

			if ( this.playerCards.length > 2 ) {
				this.dealerAI();
			}
			this.processWinner();

			return true;
		}

		return false;
	}

	hitPlayer() {

		var currCard = this.gameDeck.dealCard();
		if ( _.isNil( currCard ) ) {
			currCard = this.reShuffle();
		}

		currCard.faceUp = true;

		this.scorePoints( this.playerPoints, currCard );

		this.playerCards.push( currCard );

		return this.checkBustBlackjack( this.playerPoints, false );
	}

	playerDoubleDown() {

		//Double down the bet
		this.placeBet( null );

		if ( !this.hitPlayer() ) {
			this.stand();
		}
	}

	dealerAI() {

		//Show dealers hidden card
		this.dealerCards[1].faceUp = true;
		this.hideDealerPoints = false;

		var currPoints = this.calcPoints( this.dealerPoints );

		if ( currPoints[0] < 17 || currPoints[1] < 17 ) {

			//Dealer hit
			var currCard = this.gameDeck.dealCard();
			if ( _.isNil( currCard ) ) {
				currCard = this.reShuffle();
			}

			currCard.faceUp = true;

			this.scorePoints( this.dealerPoints, currCard );

			this.dealerCards.push( currCard );

			if( !this.checkBustBlackjack( this.dealerPoints, true ) ) {
				this.dealerAI();
			}
		}
	}

	stand() {

		//Dealer AI
		this.dealerAI();

		this.processWinner();
	}

	processWinner() {
		//Compete player & dealer score
		if ( !this.playerBusted ) {

			if ( this.dealerBusted ) {
				//player wins
				this.winnings += this.pot;
			}
			else {

				var playerScores = this.calcPoints( this.playerPoints );
				var dealerScores = this.calcPoints( this.dealerPoints );
				var playerHighest, dealerHighest;

				//Player
				if ( playerScores[0] <= 21 ) {
					if ( playerScores[0] >= playerScores[1] ) {
						playerHighest = playerScores[0]
					}
					else {
						playerHighest = playerScores[1];
					}
				}
				else {
					playerHighest = playerScores[1];
				}
				//Dealer
				if ( dealerScores[0] <= 21 ) {
					if ( dealerScores[0] >= dealerScores[1] ) {
						dealerHighest = dealerScores[0]
					}
					else {
						dealerHighest = dealerScores[1];
					}
				}
				else {
					dealerHighest = dealerScores[1];
				}

				//Final score
				if ( playerHighest === dealerHighest ) {
					//Push
					this.winnings += this.pot / 2;
					this.openSnackBar('Push');
				}
				else if ( playerHighest > dealerHighest ) {
					this.winnings += this.pot
					if ( playerHighest === 21 && this.playerCards.length === 2 ) {
						this.openSnackBar('BLACKJACK!');
					}
					else {
						this.openSnackBar('You win!');
					}
				}
				else {
					//Lost
					if ( dealerHighest === 21 && this.dealerCards.length === 2 ) {
						this.openSnackBar('Dealer Blackjack');
					}
					else {
						this.openSnackBar('Doh!');
					}
				}
			}
		}

		this.reset();
	}

	reset() {
		var hoc = this;
		//Reset
		setTimeout( () => {
			hoc.pot = null;

			//Discard
			hoc.gameDeck.discardCards( hoc.playerCards );
			hoc.gameDeck.discardCards( hoc.dealerCards );

			this.hideDealerPoints = true;
			hoc.dealerPoints = [];
			hoc.playerPoints = [];

			hoc.dealerBusted = false;
			hoc.playerBusted = false;
		}, 2000);
	}
}