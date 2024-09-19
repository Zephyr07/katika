import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MultiplicatorPage } from './multiplicator.page';

const routes: Routes = [
  {
    path: '',
    component: MultiplicatorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MultiplicatorPageRoutingModule {}
