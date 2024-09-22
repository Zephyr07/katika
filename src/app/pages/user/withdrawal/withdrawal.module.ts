import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WithdrawalPageRoutingModule } from './withdrawal-routing.module';

import { WithdrawalPage } from './withdrawal.page';
import {ModalLoadingModule} from "../../../components/modal-loading/modal-loading.module";
import {PipeModule} from "../../../pipe/pipe.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WithdrawalPageRoutingModule,
    ModalLoadingModule,
    PipeModule
  ],
  declarations: [WithdrawalPage]
})
export class WithdrawalPageModule {}
