import {bootstrap} from 'angular2/platform/browser';
import {AppModule} from './app.module';

let boot = document.addEventListener('DOMContentLoaded', () => {

	window._ = require('lodash');

	require('main');

 	bootstrap(AppModule);
});

module.exports = boot;