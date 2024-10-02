import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { Machine5xPageRoutingModule } from './machine5x-routing.module';

import { Machine5xPage } from './machine5x.page';
import {PipeModule} from "../../../pipe/pipe.module";
import {ModalMessageModule} from "../../../components/modal-message/modal-message.module";
import {ModalLoadingModule} from "../../../components/modal-loading/modal-loading.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    Machine5xPageRoutingModule,
    PipeModule,
    ModalMessageModule,
    ModalLoadingModule
  ],
  declarations: [Machine5xPage]
})
export class Machine5xPageModule {}
