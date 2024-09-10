import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DicePageRoutingModule } from './dice-routing.module';

import { DicePage } from './dice.page';
import {ModalMessageModule} from "../../../components/modal-message/modal-message.module";
import {PipeModule} from "../../../pipe/pipe.module";
import {ModalLoadingModule} from "../../../components/modal-loading/modal-loading.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DicePageRoutingModule,
    ModalMessageModule,
    PipeModule,
    ModalLoadingModule
  ],
  declarations: [DicePage]
})
export class DicePageModule {}
