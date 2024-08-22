import { Component, OnInit } from '@angular/core';
import {UtilProvider} from "../../../providers/util/util";
import {MenuController, NavController} from "@ionic/angular";
import {AuthProvider} from "../../../providers/auth/auth";
import {Router} from "@angular/router";
import {ApiProvider} from "../../../providers/api/api";
import {isCordovaAvailable} from "../../../services/utils";
import OneSignal from "onesignal-cordova-plugin";
import {NUMBER_RANGE} from "../../../services/contants";
import {AdmobProvider} from "../../../providers/admob/AdmobProvider";

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  is_loading=false;
  email:any=null;
  password="";
  settings:any={
    android:{
      subscription:false
    },
    ios:{
      subscription:false
    }
  };

  constructor(
    private util:UtilProvider,
    private auth:AuthProvider,
    private api:ApiProvider,
    private router:Router,
    private admob:AdmobProvider,
    private navCtrl:NavController,
    private menuController : MenuController
  ) {
    this.menuController.enable(false);
  }

  ionViewWillEnter() {
    this.admob.showBanner('bottom',0);
    // recupération des settings
    if(localStorage.getItem('ka_settings')!='undefined'){
      this.settings = JSON.parse(localStorage.getItem('ka_settings'));
    } else {

    }
  }

  ionViewWillLeave(){
    this.util.hideLoading();
    this.admob.removeBanner();
  }
  ngOnInit() {

  }

  login() {
    if (!isNaN(this.email) && (this.email<NUMBER_RANGE.min || this.email>NUMBER_RANGE.max)){
      this.util.doToast("phone_empty",5000)
    } else if (this.password == "" || this.password.length<6){
      this.util.doToast("password_empty",5000)
    } else {
      this.util.showLoading('identification');
      this.auth.login({email:this.email,password:this.password}).then((d:any)=>{
        if(isCordovaAvailable()){
          //OneSignal.sendTags({'country_id':d.user.country_id});
        }
        this.is_loading = true;

        this.util.hideLoading();
        localStorage.setItem('is_user','true');
        //this.navCtrl.navigateRoot(['/home']);
        if(d.user.status=='pending_activation'){
          this.util.doToast('Votre compte n\'est pas activé. Contacter le responsable de la boutique',5000, 'warning');
        } else if(d.user.status=='enable') {
          if(d.user.store_users==null){
            // pas de store
            this.navCtrl.navigateRoot(['/store-add']);
          } else {
            this.navCtrl.navigateRoot(['/home']);
          }
        } else {
          this.util.doToast('Votre compte est désactivé. Contacter le support au +237 673996540',5000, 'warning');
        }

      }, q=>{
        alert(JSON.stringify(q));
        this.util.hideLoading();
        this.util.handleError(q);
      })
    }
    //localStorage.setItem('uid','rahul');

  }

  goToRegister(){
    this.router.navigateByUrl('create-account');
  }

  createPDF(){
    this.util.createPDF();
    this.util.downloadPdf();
  }

}
