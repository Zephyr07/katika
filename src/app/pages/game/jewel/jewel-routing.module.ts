import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { JewelPage } from './jewel.page';

const routes: Routes = [
  {
    path: '',
    component: JewelPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class JewelPageRoutingModule {}
