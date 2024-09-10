import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReaperPage } from './reaper.page';

const routes: Routes = [
  {
    path: '',
    component: ReaperPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReaperPageRoutingModule {}
