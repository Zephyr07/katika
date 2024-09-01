import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ApplePageRoutingModule } from './apple-routing.module';

import { ApplePage } from './apple.page';
import {PipeModule} from "../../../pipe/pipe.module";
import {ModalMessageModule} from "../../../components/modal-message/modal-message.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ApplePageRoutingModule,
    PipeModule,
    ModalMessageModule
  ],
  declarations: [ApplePage]
})
export class ApplePageModule {}
