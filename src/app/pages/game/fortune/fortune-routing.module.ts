import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FortunePage } from './fortune.page';

const routes: Routes = [
  {
    path: '',
    component: FortunePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FortunePageRoutingModule {}
