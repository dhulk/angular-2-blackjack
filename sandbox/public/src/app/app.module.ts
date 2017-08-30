import { NgModule, Directive, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MdButtonModule, MdSnackBarModule} from '@angular/material';
import { Blackjack }  from './blackjack';
import {PlayingCard} from './cards/playingCard.component';
import {OVERLAY_PROVIDERS} from '@angular/material';

@NgModule({
  imports:      [ BrowserModule, MdButtonModule, MdSnackBarModule, BrowserAnimationsModule ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  declarations: [ Blackjack, PlayingCard ],
  bootstrap:    [ Blackjack ],
  providers: [OVERLAY_PROVIDERS]
})
export class AppModule {}