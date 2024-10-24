import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LuckyPage } from './lucky.page';

const routes: Routes = [
  {
    path: '',
    component: LuckyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LuckyPageRoutingModule {}
