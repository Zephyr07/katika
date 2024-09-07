import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ActivatedAccountPage } from './activated-account.page';

const routes: Routes = [
  {
    path: '',
    component: ActivatedAccountPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ActivatedAccountPageRoutingModule {}
