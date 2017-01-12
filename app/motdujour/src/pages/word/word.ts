import { Component } from '@angular/core';
import { Http } from '@angular/http';

import { NavController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import {TranslateService} from 'ng2-translate';

@Component({
  selector: 'page-word',
  templateUrl: 'word.html'
})
export class WordPage {
  entry = {};

  constructor(
    public navCtrl: NavController,
    public http: Http,
    public loadingCtrl: LoadingController,
    public translateService: TranslateService) {
      let loader = this.loadingCtrl.create({
        content: translateService.instant('pleaseWait')
      });
      loader.present();
      http.get('/api/words/me').map(res => res.json()).subscribe(entry => {
        loader.dismiss();
        this.entry = entry;
      });
    }

  goToStats() {
    this.navCtrl.parent.select(2);
  }
}
