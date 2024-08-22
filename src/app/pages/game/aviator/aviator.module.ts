import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AviatorPageRoutingModule } from './aviator-routing.module';

import { AviatorPage } from './aviator.page';
import {PipeModule} from "../../../pipe/pipe.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AviatorPageRoutingModule,
    PipeModule
  ],
  declarations: [AviatorPage]
})
export class AviatorPageModule {}
