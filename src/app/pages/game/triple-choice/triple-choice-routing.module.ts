import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TripleChoicePage } from './triple-choice.page';

const routes: Routes = [
  {
    path: '',
    component: TripleChoicePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TripleChoicePageRoutingModule {}
