import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import {TranslateModule} from "@ngx-translate/core";
import {PipeModule} from "../../pipe/pipe.module";
import {ModalLoadingComponent} from "./modal-loading.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    IonicModule,
    PipeModule
    ],
  declarations: [ModalLoadingComponent],
  exports: [ModalLoadingComponent]
})
export class ModalLoadingModule {}
