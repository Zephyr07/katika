import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FortunePageRoutingModule } from './fortune-routing.module';

import { FortunePage } from './fortune.page';
import {PipeModule} from "../../../pipe/pipe.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FortunePageRoutingModule,
    PipeModule
  ],
  declarations: [FortunePage]
})
export class FortunePageModule {}
