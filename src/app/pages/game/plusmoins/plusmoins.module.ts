import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PlusmoinsPageRoutingModule } from './plusmoins-routing.module';

import { PlusmoinsPage } from './plusmoins.page';
import {DicePageRoutingModule} from "../dice/dice-routing.module";
import {ModalMessageModule} from "../../../components/modal-message/modal-message.module";
import {PipeModule} from "../../../pipe/pipe.module";
import {ModalLoadingModule} from "../../../components/modal-loading/modal-loading.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PlusmoinsPageRoutingModule,
    ModalMessageModule,
    PipeModule,
    ModalLoadingModule
  ],
  declarations: [PlusmoinsPage]
})
export class PlusmoinsPageModule {}
