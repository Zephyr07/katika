import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PromoCodePage } from './promo-code.page';

const routes: Routes = [
  {
    path: '',
    component: PromoCodePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PromoCodePageRoutingModule {}
