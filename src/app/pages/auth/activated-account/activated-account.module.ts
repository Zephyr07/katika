import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ActivatedAccountPageRoutingModule } from './activated-account-routing.module';

import { ActivatedAccountPage } from './activated-account.page';
import {PipeModule} from "../../../pipe/pipe.module";
import {TranslateModule} from "@ngx-translate/core";
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ActivatedAccountPageRoutingModule,
    PipeModule,
    TranslateModule
  ],
  declarations: [ActivatedAccountPage]
})
export class ActivatedAccountPageModule {}
