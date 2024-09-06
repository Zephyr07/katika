import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import {ModalCguComponent} from "./modal-cgu.component";
import {TranslateModule} from "@ngx-translate/core";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule
    ],
  declarations: [ModalCguComponent],
  exports: [ModalCguComponent]
})
export class ModalCguModule {}
