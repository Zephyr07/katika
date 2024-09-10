import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FortunePageRoutingModule } from './fortune-routing.module';

import { FortunePage } from './fortune.page';
import {PipeModule} from "../../../pipe/pipe.module";
import {ModalMessageModule} from "../../../components/modal-message/modal-message.module";
import {ModalLoadingModule} from "../../../components/modal-loading/modal-loading.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FortunePageRoutingModule,
    PipeModule,
    ModalMessageModule,
    ModalLoadingModule
  ],
  declarations: [FortunePage]
})
export class FortunePageModule {}
