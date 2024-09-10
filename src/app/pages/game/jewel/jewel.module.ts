import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { JewelPageRoutingModule } from './jewel-routing.module';

import { JewelPage } from './jewel.page';
import {PipeModule} from "../../../pipe/pipe.module";
import {ModalMessageModule} from "../../../components/modal-message/modal-message.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    JewelPageRoutingModule,
    PipeModule,
    ModalMessageModule
  ],
  declarations: [JewelPage]
})
export class JewelPageModule {}
