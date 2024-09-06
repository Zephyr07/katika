import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SettingPageRoutingModule } from './setting-routing.module';

import { SettingPage } from './setting.page';
import {ModalCgvModule} from "../../components/modal-cgv/modal-cgv.module";
import {ModalCguModule} from "../../components/modal-cgu/modal-cgu.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SettingPageRoutingModule,
    ModalCguModule,
    ModalCgvModule,
  ],
  declarations: [SettingPage]
})
export class SettingPageModule {}
