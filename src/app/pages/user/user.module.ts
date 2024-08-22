import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UserPageRoutingModule } from './user-routing.module';

import { UserPage } from './user.page';
import {TranslateModule} from "@ngx-translate/core";
import {PipeModule} from "../../pipe/pipe.module";
import {ModalEditUserModule} from "../../components/modal-edit-user/modal-edit-user.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UserPageRoutingModule,
    PipeModule,
    TranslateModule,
    ModalEditUserModule
  ],
  declarations: [UserPage]
})
export class UserPageModule {}
