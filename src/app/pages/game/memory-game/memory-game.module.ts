import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MemoryGamePageRoutingModule } from './memory-game-routing.module';

import { MemoryGamePage } from './memory-game.page';
import {PipeModule} from "../../../pipe/pipe.module";
import {ModalMessageModule} from "../../../components/modal-message/modal-message.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MemoryGamePageRoutingModule,
    PipeModule,
    ModalMessageModule
  ],
  declarations: [MemoryGamePage]
})
export class MemoryGamePageModule {}
