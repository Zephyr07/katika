import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AccountPageRoutingModule } from './account-routing.module';

import { AccountPage } from './account.page';
import {PipeModule} from "../../../pipe/pipe.module";
import {TranslateModule} from "@ngx-translate/core";
import {ModalLoadingModule} from "../../../components/modal-loading/modal-loading.module";
import {ModalEditUserModule} from "../../../components/modal-edit-user/modal-edit-user.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AccountPageRoutingModule,
    PipeModule,
    TranslateModule,
    ModalLoadingModule,
    ModalEditUserModule
  ],
  declarations: [AccountPage]
})
export class AccountPageModule {}
