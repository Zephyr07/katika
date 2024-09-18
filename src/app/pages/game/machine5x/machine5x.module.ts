import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { Machine5xPageRoutingModule } from './machine5x-routing.module';

import { Machine5xPage } from './machine5x.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    Machine5xPageRoutingModule
  ],
  declarations: [Machine5xPage]
})
export class Machine5xPageModule {}
