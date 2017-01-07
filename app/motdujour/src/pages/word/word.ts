import { Component } from '@angular/core';
import { Http } from '@angular/http';

import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-word',
  templateUrl: 'word.html'
})
export class WordPage {
  entry = {};

  constructor(public navCtrl: NavController, public http: Http) {
    http.get('/api/words/me').map(res => res.json()).subscribe(entry => this.entry = entry);
  }

  goToStats() {
    this.navCtrl.parent.select(2);
  }
}
