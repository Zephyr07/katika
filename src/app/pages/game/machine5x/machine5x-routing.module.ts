import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Machine5xPage } from './machine5x.page';

const routes: Routes = [
  {
    path: '',
    component: Machine5xPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class Machine5xPageRoutingModule {}
