import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import {ModalEditUserComponent} from "./modal-edit-user.component";
import {TranslateModule} from "@ngx-translate/core";
import {PipeModule} from "../../pipe/pipe.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    IonicModule,
    PipeModule
    ],
  declarations: [ModalEditUserComponent],
  exports: [ModalEditUserComponent]
})
export class ModalEditUserModule {}
