import {suits} from './suits';

class DeckService {

	constructor( jokers ) {

		var hoc = this;
		var cardMax = 13;

		//Hi-lo
		hoc.hiLo = 0;

		//Discard
		hoc.discard = [];

		//Generate deck
		hoc.deck = [];
		_.each( suits, ( suit ) => {

			for ( var i = 0; i < cardMax; i++ ) {

				var nextCard = {
					suit: suit,
					id: i,
					faceUp: false
				};
				nextCard.isFace = hoc.isFace( nextCard );

				hoc.deck.push( nextCard );
			}

		});

		if ( jokers ) {
			//Add joker cards
		}
	}

	shuffle() {

		if ( this.discard.length > 0 ) {
			while ( this.discard.length > 0 ) {
				this.deck.push( this.discard.pop() );
			}
		}

		//Pre shuffle with  Fisher-Yates shuffle
		var deckCount = this.deck.length;
		var shuffledDeck = _.shuffle( this.deck );

		//Three times traditional shuffle
		var shuffleIterations = 3;
		for ( var s = 0; s < 3; s++ ) {

			var shuffleResult = [];
			//Split deck in half
			var otherHalf = [];
			for ( var i = 0; i < ( deckCount / 2 ); i++ ) {
				otherHalf.push( shuffledDeck.pop() );
			}

			//Alternate insertion into the shuffle result
			for ( var i = 0; i < deckCount; i++ ) {

				if ( (i + 1) % 2 === 0 ) {
					var currCard = otherHalf.pop();
					if ( !_.isNil( currCard ) ) {
						shuffleResult.push( currCard );
					}
				}
				else {
					var currCard = shuffledDeck.pop();
					if ( !_.isNil( currCard ) ) {
						shuffleResult.push( currCard );
					}
				}
			}
			shuffledDeck = shuffleResult;
		}
		this.deck = shuffledDeck;
		this.hiLo = 0;
	}

	peekTopCard() {

		if ( this.deck.length === 0 ) {
			//No top card need to shuff discards
			this.shuffle();
		}

		return this.deck[ this.deck.length - 1];
	}

	dealCard() {
		var dealtCard = this.deck.pop();

		//Calc HiLo
		if ( !_.isNil( dealtCard) ) {
			var cardScore = this.getBlackjackScore( dealtCard );
			if ( cardScore.length > 1 ) {
				//Ace!
				this.hiLo--;
			}
			else if ( cardScore[0] <= 6 ) {
				this.hiLo++;
			}
			else if ( cardScore[0] === 10 ) {
				this.hiLo--;
			}
		}

		return dealtCard;
	}

	getHiLo() {
		return this.hiLo;
	}

	_getCards() {
		return this.deck;
	}

	isFace( card ) {
		return ( card.id > 8 );
	}

	discardCards( cards ) {

		while ( cards.length > 0 ) {

			var card = cards.pop();
			//Flip the card
			card.faceUp = false;
			this.discard.push( card );
		}
	}

	getBlackjackScore( card ) {
		if ( card.id >= 0 && card.id <= 8 ) {
			return [card.id + 2];
		}
		else if ( card.id > 8 ) {

			if ( card.id === 12 ) {
				//Ace
				return [11, 1];
			}
			else {
				return [10];
			}

		}
	}

}

export {DeckService};