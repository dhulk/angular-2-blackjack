import {Component, Input} from '@angular/core';
import {DeckService} from './deck.service';
import {suits} from './suits';

@Component({
	selector: 	'playing-card',
				template: `<div class="card" *ngIf="card.faceUp" >
								<div class="top-left-title">
									<span >{{displayName()}}</span>
									<span [className]="isRed()">{{displaySuit()}}</span>
								</div>
								<div class="face-card-border">
									<span class="face-card-portrait" *ngIf="card.isFace" >{{getFace()}}</span>
								</div>
								<div class="bottom-right-title">
									<span>{{displayName()}}</span>
									<span [className]="isRed()">{{displaySuit()}}</span>
								</div>
							</div>
							<div class="card card-back" *ngIf="!card.faceUp"></div>`
})
export class PlayingCard {

	@Input()
	card = {
		id: null,
		suit: null
	};

	suitHash = {};

	constructor() {

		this.suitHash[ suits.SPADES ] = 'q';
		this.suitHash[ suits.CLUBS ] = 'w';
		this.suitHash[ suits.HEARTS ] = 'r';
		this.suitHash[ suits.DIAMONDS ] = 'e';
	}

	displaySuit() {
		return this.suitHash[ this.card.suit ];
	}

	isRed() {
		if ( this.card.suit === suits.HEARTS || this.card.suit === suits.DIAMONDS ) {
			return 'red-card';
		}
	}

	displayName() {

		if ( this.card.id >= 0 && this.card.id <= 7 ) {
			return this.card.id + 2;
		}
		else {
			switch ( this.card.id ) {
				case 8:
					return '0';
				case 9:
					return 'a';
				case 10:
					return 's';
				case 11:
					return 'd';
				case 12:
					return '1';
			}
		}
	}

	getFace() {
		switch ( this.card.id ) {
			case 9:
				return 'v';
			case 10:
				return '@';
			case 11:
				return 'c';
			/*case 12:
				return '1';*/
		}
	}
}