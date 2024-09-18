import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Machine3xPage } from './machine3x.page';

const routes: Routes = [
  {
    path: '',
    component: Machine3xPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class Machine3xPageRoutingModule {}
