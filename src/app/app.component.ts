import { Component } from '@angular/core';
import * as moment from "moment";
import {environment} from "../environments/environment";

import {ONE_SIGNAL_CONF} from "./services/contants";
import {isCordovaAvailable} from "./services/utils";
import OneSignal from 'onesignal-cordova-plugin';
import {NotificationProvider} from "./providers/notification/notification";
import {AdmobProvider} from "./providers/admob/AdmobProvider";
import {ApiProvider} from "./providers/api/api";
import {AuthProvider} from "./providers/auth/auth";
import {UtilProvider} from "./providers/util/util";
import { ScreenOrientation } from '@capacitor/screen-orientation';
import {SplashScreen} from "@capacitor/splash-screen";
import {App} from "@capacitor/app";
import {AlertController} from "@ionic/angular";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  version = environment.version;
  is_loading = false;

  constructor(

    private admob:AdmobProvider,
    private notif: NotificationProvider,
    private alertController:AlertController
  ) {
    this.admob.initialize();
    this.splash();
    moment.locale('fr');
    if(isCordovaAvailable()){
      this.majeur();
      ScreenOrientation.lock({ orientation: 'portrait' });
      this.OneSignalInit();
      this.notif.init();
      this.notif.navigationEvent.subscribe(
        data => {
          console.log(data);
        }
      );
    }
  }

  async splash(){
    await SplashScreen.show({
      showDuration: 2000,
      fadeInDuration:100,
      fadeOutDuration:100,
      autoHide: true,
    });
  }

  async majeur(){
    const alert = await this.alertController.create({
      //header: "Information",
      subHeader:"Nul n'entre ici, s'il n'a pas plus de 21 ans!",
      message:'Les jeux que nous proposons sont reservés aux personnes agées de plus de 21 ans. Avez vous 21 ans ou plus?',
      buttons: [
        {
          text: "Non",
          role: 'cancel',
          handler:()=>{
            App.exitApp();
          }
        },
        {
          text: "Oui",
          role:'confirm'
        },
      ]
    });

    await alert.present();
  }

  OneSignalInit(){
    //alert("eaz");
    // Uncomment to set OneSignal device logging to VERBOSE
    OneSignal.Debug.setLogLevel(6);

    // NOTE: Update the setAppId value below with your OneSignal AppId.
    OneSignal.initialize(ONE_SIGNAL_CONF.app_id);
    /*OneSignal.setNotificationOpenedHandler(function(jsonData) {
      console.log('notificationOpenedCallback: ' + JSON.stringify(jsonData));
    });*/
    OneSignal.Notifications.addEventListener('click', async (e) => {
      let clickData = await e.notification;
      console.log("Notification Clicked : " + clickData);
    })


    // iOS - Prompts the user for notification permissions.
    //    * Since this shows a generic native prompt, we recommend instead using an In-App Message to prompt for notification permission (See step 6) to better communicate to your users what notifications they will get.
    OneSignal.Notifications.requestPermission(true).then((success: Boolean) => {
      console.log("Notification permission granted " + success);
    })
  }
}
