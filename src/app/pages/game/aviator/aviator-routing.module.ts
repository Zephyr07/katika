import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AviatorPage } from './aviator.page';

const routes: Routes = [
  {
    path: '',
    component: AviatorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AviatorPageRoutingModule {}
