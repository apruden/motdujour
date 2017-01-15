import { Component } from '@angular/core';
import { Http } from '@angular/http';
import { Storage } from '@ionic/storage';
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
    public storage: Storage,
    public loadingCtrl: LoadingController,
    public translateService: TranslateService) {
      this.storage.get('stats').then(stats => {
        if (stats === null) {
          let now = this.toDate(new Date());
          stats = [{date: now, day: 1, week: 1, month: 1}];
          this.storage.set('stats', stats);
        }

        let loader = this.loadingCtrl.create({
          content: translateService.instant('pleaseWait')
        });
        loader.present();
        http.get('/api/words/me').map(res => res.json()).subscribe(entry => {
          loader.dismiss();
          this.entry = entry;
        });
      });
    }

  goToStats() {
    this.navCtrl.parent.select(2);
  }

  toDate(date: Date) {
    let m = date.getUTCMonth() + 1;
    let d = date.getUTCDate();
    return parseInt('' + date.getUTCFullYear() + '' + (m < 10 ? '0' + m : m)  + '' + (d < 10 ? '0' + d : d), 10);
  }
}
