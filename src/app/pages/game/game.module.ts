import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GamePageRoutingModule } from './game-routing.module';

import { GamePage } from './game.page';
import {PipeModule} from "../../pipe/pipe.module";
import {ModalLoadingModule} from "../../components/modal-loading/modal-loading.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GamePageRoutingModule,
    PipeModule,
    ModalLoadingModule
  ],
  declarations: [GamePage]
})
export class GamePageModule {}
