import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PromoCodePageRoutingModule } from './promo-code-routing.module';

import { PromoCodePage } from './promo-code.page';
import {PipeModule} from "../../../pipe/pipe.module";
import {ModalLoadingModule} from "../../../components/modal-loading/modal-loading.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PromoCodePageRoutingModule,
    PipeModule,
    ModalLoadingModule
  ],
  declarations: [PromoCodePage]
})
export class PromoCodePageModule {}
