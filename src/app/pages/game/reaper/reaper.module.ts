import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReaperPageRoutingModule } from './reaper-routing.module';

import { ReaperPage } from './reaper.page';
import {PipeModule} from "../../../pipe/pipe.module";
import {ModalMessageModule} from "../../../components/modal-message/modal-message.module";
import {ModalLoadingModule} from "../../../components/modal-loading/modal-loading.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReaperPageRoutingModule,
    PipeModule,
    ModalMessageModule,
    ModalLoadingModule
  ],
  declarations: [ReaperPage]
})
export class ReaperPageModule {}
