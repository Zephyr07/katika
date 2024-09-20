import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DashboardPageRoutingModule } from './dashboard-routing.module';

import { DashboardPage } from './dashboard.page';
import {TranslateModule} from "@ngx-translate/core";
import {PipeModule} from "../../pipe/pipe.module";
import {ModalLoadingModule} from "../../components/modal-loading/modal-loading.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DashboardPageRoutingModule,
    TranslateModule,
    PipeModule,
    ModalLoadingModule
  ],
  declarations: [DashboardPage]
})
export class DashboardPageModule {}
