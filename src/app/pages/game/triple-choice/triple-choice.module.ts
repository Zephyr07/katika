import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TripleChoicePageRoutingModule } from './triple-choice-routing.module';

import { TripleChoicePage } from './triple-choice.page';
import {TranslateModule} from "@ngx-translate/core";
import {PipeModule} from "../../../pipe/pipe.module";
import {ModalMessageModule} from "../../../components/modal-message/modal-message.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TripleChoicePageRoutingModule,
    TranslateModule,
    PipeModule,
    ModalMessageModule
  ],
  declarations: [TripleChoicePage]
})
export class TripleChoicePageModule {}
