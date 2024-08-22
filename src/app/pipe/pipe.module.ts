import {NgModule} from '@angular/core';
import { IonicModule } from '@ionic/angular';
import {StatutPipe} from "./status";
import {PriceFormatPipe} from "./price-format";
import {LimitToPipe} from "./limit-to";
import {FilterPipe} from "./filter.pipe";
import {DateFormatPipe} from "./date-format";
import {SafePipe} from "./safe";


@NgModule({
  declarations: [
    DateFormatPipe,
    StatutPipe,
    PriceFormatPipe,
    SafePipe,
    StatutPipe,
    FilterPipe,
    LimitToPipe,
  ],
  imports: [IonicModule],
  exports: [
    DateFormatPipe,
    StatutPipe,
    PriceFormatPipe,
    StatutPipe,
    FilterPipe,
    SafePipe,
    LimitToPipe,
  ]
})
export class PipeModule {
}
