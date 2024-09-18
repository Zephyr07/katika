import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { Machine3xPageRoutingModule } from './machine3x-routing.module';

import { Machine3xPage } from './machine3x.page';
import {PipeModule} from "../../../pipe/pipe.module";
import {ModalMessageModule} from "../../../components/modal-message/modal-message.module";
import {ModalLoadingModule} from "../../../components/modal-loading/modal-loading.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    Machine3xPageRoutingModule,
    PipeModule,
    ModalMessageModule,
    ModalLoadingModule
  ],
  declarations: [Machine3xPage]
})
export class Machine3xPageModule {}
