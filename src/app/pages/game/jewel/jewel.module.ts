import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { JewelPageRoutingModule } from './jewel-routing.module';

import { JewelPage } from './jewel.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    JewelPageRoutingModule
  ],
  declarations: [JewelPage]
})
export class JewelPageModule {}
