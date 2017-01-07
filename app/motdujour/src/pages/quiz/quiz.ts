import { Component } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Storage } from '@ionic/storage';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-quiz',
  templateUrl: 'quiz.html'
})
export class QuizPage {
  sent = false;
  questions = [];

  constructor(public navCtrl: NavController, public http: Http, public storage: Storage) {
    this.storage.get('lastAnswer').then((val)=> {
      if(!val || val.date !== this.toDate(new Date())) {
        http.get('/api/questions').map(res => res.json()).subscribe(questions => this.questions = questions);
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
      'day': this.questions[0] ? this.questions[0].result : 0,
      'week': this.questions[1] ? this.questions[1].result : 0,
      'month': this.questions[2] ? this.questions[2].result : 0
    };
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    this.storage.get('stats').then(stats => {
      let a = 0.3;

      if (stats === null) {
        stats = [{day: 1, week: 1, month: 1}];
      }

      let b = stats[stats.length - 1];
      let n = {day: a * data.day + (1 - a) * b.day,
            week: a * data.week + (1-a) * b.week,
          month: a * data.month + (1-a) * b.month
      };

      stats.push(n);

      this.storage.set('stats', stats);
    });

    return this.http.post('/api/stats/1', data, options)
            .subscribe(r => {
              this.sent = true;
              this.storage.set('lastAnswer', {date: this.toDate(new Date()), 
                               questions: this.questions});
            });
  }

  goToNext() {
    this.navCtrl.parent.select(1);
  }
}
