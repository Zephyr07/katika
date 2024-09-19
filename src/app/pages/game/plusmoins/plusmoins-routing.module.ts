import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PlusmoinsPage } from './plusmoins.page';

const routes: Routes = [
  {
    path: '',
    component: PlusmoinsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlusmoinsPageRoutingModule {}
