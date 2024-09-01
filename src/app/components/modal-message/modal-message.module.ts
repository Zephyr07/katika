import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import {TranslateModule} from "@ngx-translate/core";
import {PipeModule} from "../../pipe/pipe.module";
import {ModalMessageComponent} from "./modal-message.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    IonicModule,
    PipeModule
    ],
  declarations: [ModalMessageComponent],
  exports: [ModalMessageComponent]
})
export class ModalMessageModule {}
