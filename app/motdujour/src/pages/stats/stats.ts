import { Component } from '@angular/core';
import { Http } from '@angular/http';
import { Storage } from '@ionic/storage';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-stats',
  templateUrl: 'stats.html'
})
export class StatsPage {

  constructor(public navCtrl: NavController, public http: Http, public storage: Storage) {
    this.storage.get('stats').then(data => {
      if(data !== null) {
          let day = [];
          let week = [];
          let month = [];
          data.forEach( e => {
            month.push(e.month);
            week.push(e.week);
            day.push(e.day);
          });
          this.lineChartData = [{data: day, label: 'day'},
            {data: week, label:'week'},
          {data: month, label: 'month'}];
      } else {
        http.get('/api/stats/1').map(res => res.json()).subscribe(data => {
          let day = [];
          let week = [];
          let month = [];
          data.forEach( e => {
            month.push(e.month);
            week.push(e.week);
            day.push(e.day);
          });
          this.lineChartData = [{data: day, label: 'day'},
            {data: week, label:'week'},
          {data: month, label: 'month'}];
        });
      }
    });
  }

  public lineChartData:Array<any> = [{data: [], label: 'day'},
        {data: [], label:'week'},
        {data: [], label: 'month'}];

  public lineChartLabels:Array<any> = [];

  public lineChartOptions:any = {
    animation: false,
    responsive: true
  };

  public lineChartColors:Array<any> = [
    { // grey
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    },
    { // dark grey
      backgroundColor: 'rgba(77,83,96,0.2)',
      borderColor: 'rgba(77,83,96,1)',
      pointBackgroundColor: 'rgba(77,83,96,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(77,83,96,1)'
    },
    { // grey
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }
  ];

  public lineChartLegend:boolean = true;
  public lineChartType:string = 'Data';
}
