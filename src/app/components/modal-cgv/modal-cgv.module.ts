import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import {ModalCgvComponent} from "./modal-cgv.component";
import {TranslateModule} from "@ngx-translate/core";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule
    ],
  declarations: [ModalCgvComponent],
  exports: [ModalCgvComponent]
})
export class ModalCgvModule {}
