import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TripleChoicePageRoutingModule } from './triple-choice-routing.module';

import { TripleChoicePage } from './triple-choice.page';
import {GameBlockModule} from "../../../components/game-block/game-block.module";
import {TranslateModule} from "@ngx-translate/core";
import {PipeModule} from "../../../pipe/pipe.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TripleChoicePageRoutingModule,
    GameBlockModule,
    TranslateModule,
    PipeModule,
  ],
  declarations: [TripleChoicePage]
})
export class TripleChoicePageModule {}
