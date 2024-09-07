import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {environment} from "../../../environments/environment";
import * as moment from "moment";
import {ApiProvider} from "../../providers/api/api";
import {Share} from "@capacitor/share";
import {ModalCgvComponent} from "../../components/modal-cgv/modal-cgv.component";
import {ModalCguComponent} from "../../components/modal-cgu/modal-cgu.component";
import {ModalController} from "@ionic/angular";
import {UtilProvider} from "../../providers/util/util";

@Component({
  selector: 'app-setting',
  templateUrl: './setting.page.html',
  styleUrls: ['./setting.page.scss'],
})
export class SettingPage implements OnInit {
  version = environment.version;
  lang="Français";

  private promo_code:any ={};
  private user:any ={};
  username="";
  is_user=false;

  constructor(
    private router:Router,
    private modalController:ModalController,
    private api:ApiProvider,
    private util:UtilProvider
  ) {
    this.lang = moment.locale();
  }

  ngOnInit() {
  }

  ionViewWillEnter(){
    if(this.api.checkUser()){
      this.is_user=true;
      this.user=JSON.parse(localStorage.getItem('user_ka'));
      this.api.getList('auth/me',{id:this.user.id}).then((a:any)=>{
        this.user = a.data.user;
        this.username = this.user.user_name;
        this.getPromoCode(this.user.id);
        localStorage.setItem('user_ka',JSON.stringify(this.user));
      });
    } else {
      this.is_user=false;
    }
  }

  getPromoCode(user_id){
    const opt = {
      user_id
    };
    this.api.getList('promo_codes',opt).then((d:any)=>{
      if(d.length>0){
        this.promo_code = d[0];
      } else {
        this.promo_code ={
          code:"Vous n'avez pas de code promo",
          son:0,
          amount:0
        }
      }
    },q=>{
      this.util.handleError(q);
    })
  }

  showUser(){
    if(this.is_user){
      this.router.navigateByUrl('account');
    } else {
      this.router.navigateByUrl('login');
    }
  }

  showHome(){
    this.router.navigateByUrl('home');
  }

  showSetting(){
    this.router.navigateByUrl('setting');
  }

  history(){
    this.router.navigateByUrl('setting/history');
  }

  joinGroup(){
    window.location.href="https://t.me/+vgMemP-Xj2o1ODhk";
  }

  contactUs(){
    window.location.href="http://t.me/holyghost777?text=Bonjour+Katika";
  }

  async sharePromoCode(){
    await Share.share({
      title: 'Katika - Games',
      text: 'Inscris toi avec mon code promo '+ this.promo_code.code+' et gagne '+this.promo_code.bonus+' W gratuit dans l\'application Katika.',
      url: 'https://play.google.com/store/apps/details?id=com.warzone237.katika'
    });
  }

  async shareApp(){
    await Share.share({
      title: 'Katika - Games',
      text: 'Découvrez Katika, l\'application ultime pour les amateurs de jeux et de défis ! Plongez dans une variété de jeux captivants et participez à nos challenges hebdomadaires pour avoir la chance de remporter des prix incroyables. Ne manquez pas cette opportunité de jouer, vous amuser, et gagner. Téléchargez Katika dès maintenant et relevez le défi !',
      url: 'https://play.google.com/store/apps/details?id=com.warzone237.katika'
    });
  }

  async cgv(){
    const modal = await this.modalController.create({
      component: ModalCgvComponent,
      cssClass: 'my-custom-class',
    });
    return await modal.present();
  }

  async cgu(){
    const modal = await this.modalController.create({
      component: ModalCguComponent,
      cssClass: 'my-custom-class',
    });
    return await modal.present();
  }
}
