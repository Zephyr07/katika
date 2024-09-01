import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {PipeModule} from "./pipe/pipe.module";
import {ApiProvider} from "./providers/api/api";
import {UtilProvider} from "./providers/util/util";
import {AuthProvider} from "./providers/auth/auth";
import {RouteProvider} from "./providers/util/route";
import {NotificationProvider} from "./providers/notification/notification";
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {HttpClientModule, HttpClient} from '@angular/common/http';
import {AdmobProvider} from "./providers/admob/AdmobProvider";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}


@NgModule({
  declarations: [
    AppComponent
  ],
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    BrowserModule,
    BrowserAnimationsModule, // Add this line
    PipeModule,
    HttpClientModule,
    TranslateModule.forRoot({
      defaultLanguage: 'fr',
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    IonicModule.forRoot({
      backButtonText: ''
    }),
    AppRoutingModule,
  ],
  providers: [
    {
      provide: RouteReuseStrategy,
      useClass: IonicRouteStrategy
    },
    ApiProvider,
    UtilProvider,
    AuthProvider,
    AdmobProvider,
    RouteProvider,
    NotificationProvider,
  ],
  bootstrap: [
    AppComponent
  ],
})
export class AppModule {}

