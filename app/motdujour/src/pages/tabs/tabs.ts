import { Component } from '@angular/core';

import { QuizPage } from '../quiz/quiz';
import { WordPage } from '../word/word';
import { StatsPage } from '../stats/stats';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  // this tells the tabs component which Pages
  // should be each tab's root Page
  tab1Root: any = QuizPage;
  tab2Root: any = WordPage;
  tab3Root: any = StatsPage;

  constructor() {

  }
}
