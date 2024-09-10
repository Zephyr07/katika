import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PuzzlePageRoutingModule } from './puzzle-routing.module';

import { PuzzlePage } from './puzzle.page';
import {PipeModule} from "../../../pipe/pipe.module";
import {ModalMessageModule} from "../../../components/modal-message/modal-message.module";
import {ModalLoadingModule} from "../../../components/modal-loading/modal-loading.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PuzzlePageRoutingModule,
    PipeModule,
    ModalMessageModule,
    ModalLoadingModule

  ],
  declarations: [PuzzlePage]
})
export class PuzzlePageModule {}
