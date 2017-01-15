import { Component } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Storage } from '@ionic/storage';
import { NavController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import { TranslateService } from 'ng2-translate';

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
    this.storage.get('lastAnswer').then((lastAnswer) => {
      this.storage.get('stats').then((stats) => {
        let now = this.toDate(new Date());
        if (!lastAnswer || lastAnswer.date !== now) {
          let lastDate = lastAnswer && lastAnswer.date ? lastAnswer.date : now;
          let lastStatsDate = stats && stats.length && stats[0].date ? stats[0].date : now;
          let fro = Math.min(lastDate, lastStatsDate);

          let loader = this.loadingCtrl.create({
            content: translateService.instant('pleaseWait')
          });
          loader.present();
          http.get('/api/questions?from=' + fro).map(res => res.json()).subscribe(questions => {
            loader.dismiss();
            questions.forEach(q => {
              q.text = q.text.replace(new RegExp(q.answer, 'ig'), '<strong style="color: red;">__à completer__</strong>');
            });
            this.questions = questions;
          });
        } else {
          this.questions = lastAnswer.questions;
          this.sent = true;
        }
      });
    });
  }

  toDate(date: Date) {
    let m = date.getUTCMonth() + 1;
    let d = date.getUTCDate();
    return parseInt('' + date.getUTCFullYear() + '' + (m < 10 ? '0' + m : m)  + '' + (d < 10 ? '0' + d : d), 10);
  }

  sendResponse() {
    let now = this.toDate(new Date());
    this.questions.forEach(q => q.result = q.userAnswer === q.answer ? 1 : 0);
    let data = {
      'date': now,
      'day': this.questions[0] === undefined ? 1 : this.questions[0].result,
      'week': this.questions[1] === undefined ? 1 : this.questions[1].result,
      'month': this.questions[2] === undefined ? 1 : this.questions[2].result
    };
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    this.storage.get('stats').then(stats => {
      let a = 0.3;
      let b = stats[stats.length - 1];
      let n = {
        date: data.date,
        day: a * data.day + (1 - a) * b.day,
        week: a * data.week + (1 - a) * b.week,
        month: a * data.month + (1 - a) * b.month
      };
      stats.push(n);
      this.storage.set('stats', stats.splice(0, 60));
    });

    this.sent = true;
    this.storage.set('lastAnswer', {
      date: now,
      questions: this.questions
    });

    this.storage.get('user').then(user => {
      let currentUser = user;

      if(!user) {
        currentUser = {uid: now};
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
