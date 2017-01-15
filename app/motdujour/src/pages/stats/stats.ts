import { Component } from '@angular/core';
import { Http } from '@angular/http';
import { Storage } from '@ionic/storage';
import { NavController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import {TranslateService} from 'ng2-translate';

@Component({
  selector: 'page-stats',
  templateUrl: 'stats.html'
})
export class StatsPage {

  constructor(public navCtrl: NavController,
              public http: Http,
              public storage: Storage,
              public loadingCtrl: LoadingController,
              public translateService: TranslateService) {
        translateService.get(['day', 'week', 'month', 'pleaseWait']).subscribe(labels => {
          this.storage.get('stats').then(data => {
            if(data !== null) {
              let day = [];
              let week = [];
              let month = [];
              data.forEach(e => {
                month.push(e.month);
                week.push(e.week);
                day.push(e.day);
              });
              this.lineChartData = [
                {data: day, label: labels.day},
                {data: week, label: labels.week},
                {data: month, label: labels.month}
              ];
            }
          });
        });
  }

  public lineChartData:Array<any> = [];
  public lineChartLabels:Array<any> = [];
  public lineChartOptions:any = {
    animation: false,
    responsive: true,
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero:true
        }
      }]
    }
  };
  public lineChartLegend:boolean = true;
  public lineChartType:string = 'line';
}
