import { Component } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Storage } from '@ionic/storage';
import { NavController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import {TranslateService} from 'ng2-translate';

@Component({
  selector: 'page-quiz',
  templateUrl: 'quiz.html'
})
export class QuizPage {
  sent = false;
  questions = [];

  constructor(public navCtrl: NavController,
              public http: Http,
              public storage: Storage,
              public loadingCtrl: LoadingController,
              public translateService: TranslateService) {
    this.storage.get('lastAnswer').then((val)=> {
      if(!val || val.date !== this.toDate(new Date())) {
        let loader = this.loadingCtrl.create({
          content: translateService.instant('pleaseWait')
        });
        loader.present();
        http.get('/api/questions').map(res => res.json()).subscribe(questions => {
          loader.dismiss();
          questions.forEach(q => {
            q.text = q.text.replace(new RegExp(q.answer, 'ig'), '???');
          });
          this.questions = questions;
        });
      } else {
        this.questions = val.questions;
        this.sent = true;
      }
    });
  }

  toDate(date: Date) {
    return '' + date.getUTCFullYear() + '-' + date.getUTCMonth() + '-' + date.getUTCDate();
  }

  sendResponse() {
    this.questions.forEach(q => q.result = q.userAnswer === q.answer ? 1 : 0);
    let data = {
      'day': this.questions[0] === undefined ? 1 : this.questions[0].result,
      'week': this.questions[1] === undefined ? 1 : this.questions[1].result,
      'month': this.questions[2] === undefined ? 1 : this.questions[2].result
    };
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    this.storage.get('stats').then(stats => {
      let a = 0.3;

      if (stats === null) {
        stats = [{day: 1, week: 1, month: 1}];
      }

      let b = stats[stats.length - 1];
      let n = {
        day: a * data.day + (1 - a) * b.day,
        week: a * data.week + (1-a) * b.week,
        month: a * data.month + (1-a) * b.month
      };
      stats.push(n);
      this.storage.set('stats', stats);
    });

    this.sent = true;
    this.storage.set('lastAnswer', {
      date: this.toDate(new Date()),
      questions: this.questions
    });

    this.storage.get('user').then(user => {
      let currentUser = user;
      if(!user) {
        currentUser = {uid: new Date().getTime()};
        this.storage.set('user', currentUser);
      }

      this.http.post('/api/stats/' + currentUser.uid, data, options)
      .subscribe(r => {
        //this.sent = true;
        //this.storage.set('lastAnswer', {
        //  date: this.toDate(new Date()),
        //  questions: this.questions
        //});
      });
    });
  }

  goToNext() {
    this.navCtrl.parent.select(1);
  }
}
