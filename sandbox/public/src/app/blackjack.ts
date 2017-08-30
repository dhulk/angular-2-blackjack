declare function require(string): string;
import * as _ from 'lodash';
import {Component} from '@angular/core';
import {MdSnackBar} from '@angular/material';
import {DeckService} from './cards/deck.service';

@Component({
	styles: [require('main')],
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
						<button md-button (click)="deal()" *ngIf="playerBet === null" href="#">Deal</button>
						<button md-button (click)="hitPlayer()" *ngIf="playerBet !== null" href="#">Hit</button>
						<button md-button (click)="stand()" *ngIf="playerBet !== null" href="#">Stand</button>
					</div>
				</div>`
})
export class Blackjack {

	winnings = 100;

	gameDeck = new DeckService();

	dealerCards = [];
	playerCards = [];

	hideDealerPoints = true;
	dealerPoints = [];
	playerPoints = [];

	dealerBusted = false;
	playerBusted = false;

	playerBet = null;

	_snackBar = null;

	constructor ( snackBar: MdSnackBar ) {

		this._snackBar = snackBar;

		//Startup
		this.gameDeck.shuffle();
	}

	openSnackBar(message) {
	    this._snackBar.open(message, '', {
	      duration: 2000,
	    });
	    //this.MdSnackBar.open(message, 'OK', this.snackConfig);
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

	deal() {

		//Make 10$ bet for player reset at zero
		if ( this.winnings === 0 ) {
			this.winnings = 100;
		}

		this.playerBet = 10;
		this.winnings -= 10;

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

			this.openSnackBar('BLACKJACK!');

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

		this.checkBustBlackjack( this.playerPoints, false );
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
				this.winnings += (this.playerBet * 2);
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
					this.winnings += this.playerBet;
					this.openSnackBar('Push');
				}
				else if ( playerHighest > dealerHighest ) {
					this.winnings += this.playerBet * 2
					this.openSnackBar('You win!');
				}
				else {
					//Lost
					this.openSnackBar('Doh!');
				}
			}
		}

		this.reset();
	}

	reset() {
		var hoc = this;
		//Reset
		setTimeout( () => {
			hoc.playerBet = null;

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