import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LuckyPageRoutingModule } from './lucky-routing.module';

import { LuckyPage } from './lucky.page';
import {ModalLoadingModule} from "../../../components/modal-loading/modal-loading.module";
import {ModalMessageModule} from "../../../components/modal-message/modal-message.module";
import {PipeModule} from "../../../pipe/pipe.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LuckyPageRoutingModule,
    ModalLoadingModule,
    ModalMessageModule,
    PipeModule
  ],
  declarations: [LuckyPage]
})
export class LuckyPageModule {}
