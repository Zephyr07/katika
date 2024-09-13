import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {environment} from "../../../environments/environment";
import * as moment from "moment";
import {ApiProvider} from "../../providers/api/api";
import {Share} from "@capacitor/share";
import {ModalCgvComponent} from "../../components/modal-cgv/modal-cgv.component";
import {ModalCguComponent} from "../../components/modal-cgu/modal-cgu.component";
import {AlertController, ModalController, Platform} from "@ionic/angular";
import {UtilProvider} from "../../providers/util/util";
import {NUMBER_RANGE} from "../../services/contants";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-setting',
  templateUrl: './setting.page.html',
  styleUrls: ['./setting.page.scss'],
})
export class SettingPage implements OnInit {
  version = environment.version;
  lang="Français";

  CANCEL="";
  UPDATE="";
  TEXT="";
  PHONE="";
  PASS="";
  NEW_PASS="";
  AMOUNT="";

  can_recharge=false;

  private promo_code:any ={};
  private user:any ={};
  username="";
  is_user=false;

  constructor(
    private router:Router,
    private modalController:ModalController,
    private alertController:AlertController,
    private api:ApiProvider,
    private util:UtilProvider,
    private translate:TranslateService,
    private platform:Platform
  ) {
    this.translate.get('cancel').subscribe( (res: string) => {
      this.CANCEL=res;
    });
    this.translate.get('confirm').subscribe( (res: string) => {
      this.UPDATE=res;
    });
    this.translate.get('recharge_account').subscribe( (res: string) => {
      this.TEXT=res;
    });
    this.translate.get('phone').subscribe( (res: string) => {
      this.PHONE=res;
    });
    this.translate.get('amount').subscribe( (res: string) => {
      this.AMOUNT=res;
    });
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

      this.api.getSettings().then((d:any)=>{
        if(this.platform.is('ios')){
          this.can_recharge= d.ios.recharge=='enable';
        } else {
          this.can_recharge= d.android.recharge=='enable';
        }
      })
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
    window.location.href="https://t.me/katika_games";
  }

  contactUs(){
    window.location.href="http://t.me/leGrand_k?text=Bonjour Katika";
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

  async recharge() {
    if(this.can_recharge){
      const alert = await this.alertController.create({
        header: this.TEXT,
        message:"Entrez le numéro mobile money et le nombre de point que vous souhaitez recharger. La recharge minimum est de 50.",
        buttons: [
          {
            text: this.CANCEL,
            role: 'cancel',
          },
          {
            text: this.UPDATE,
            role:'confirm',
            handler:(data)=>{
              if(!isNaN(data.phone) && data.phone <= NUMBER_RANGE.max && data.phone >= NUMBER_RANGE.min){
                this.util.showLoading("treatment");
                const opt = {
                  amount:data.amount,
                  user_id:this.user.id
                };
                let crypt = this.util.encryptAESData(opt);
                this.api.post('init_buy_account',{value:crypt}).then(async (d:any) => {
                  d = this.util.decryptAESData(JSON.stringify(d));
                  const op = this.util.encryptAESData({
                    id:d.payment.id,
                    phone:data.phone
                  });
                  // initialisation du payment my-coolPay
                  this.api.post('payment',{value:op}).then(e=>{
                    e = this.util.decryptAESData(JSON.stringify(e));
                    this.util.hideLoading();
                    this.util.doToast('payment_pending',5000,'medium');
                    // redirection vers la page de l'user
                    /*setTimeout(()=>{
                      this.navCtrl.navigateRoot(['/user']);
                    },3000)*/
                  }, q=>{
                    this.util.hideLoading();
                    this.util.handleError(q);
                  })
                  //console.log(d);
                },q=>{
                  this.util.hideLoading();
                  this.util.handleError(q);
                });
              } else {
                this.util.doToast('Veuillez entrer un numéro de téléphone valide',3000);
              }
            }
          },
        ],
        inputs: [
          {
            placeholder: this.AMOUNT,
            type:'number',
            name:'amount',
            attributes: {
              step:50,
              min: 0
            },
          },
          {
            placeholder: this.PHONE,
            value:this.user.phone,
            type:'number',
            name:'phone',
            attributes: {
              min: NUMBER_RANGE.min,
              max: NUMBER_RANGE.max
            },
          }
        ],
      });

      await alert.present();
    } else {
      window.location.href="http://t.me/leGrand_k?text=Bonjour je souhaite recharger mon compte, ci-apres mon nom d'utilisateur "+this.user.user_name;
    }

  }
}
