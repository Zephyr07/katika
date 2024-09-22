import { Component, OnInit } from '@angular/core';
import {ApiProvider} from "../../../providers/api/api";
import {UtilProvider} from "../../../providers/util/util";
import {AlertController} from "@ionic/angular";
import * as moment from "moment";
import {NUMBER_RANGE} from "../../../services/contants";

@Component({
  selector: 'app-promo-code',
  templateUrl: './promo-code.page.html',
  styleUrls: ['./promo-code.page.scss'],
})
export class PromoCodePage implements OnInit {

  user_number=100;
  discount=5;
  mise=5000;
  private user:any={};
  showLoading=true;
  private isPromo = false;
  code:any={};

  constructor(
    private api:ApiProvider,
    private util:UtilProvider,
    private alertController:AlertController
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter(){
    this.showLoading=true;
    if (this.api.checkUser()) {
      let user = JSON.parse(localStorage.getItem('user_ka'));
      this.api.getList('auth/me',{id:user.id}).then((a:any)=>{
        this.user = a.data.user;
        this.getPromoCode(this.user.id);

        this.api.getSettings().then((d:any)=>{
          this.discount = d.promo_code_discount;
          this.mise = d.promo_code_min_mise;
          this.user_number = d.promo_code_number;
          this.showLoading=false;
        })
      });
    } else {
      this.util.doToast('Vous n\'êtes pas connecté',2000,'light');
      this.showLoading=false;
    }

  }

  getPromoCode(user_id){
    const opt={
      user_id
    };

    this.api.getList('promo_codes',opt).then((d:any)=>{
      if(d.length>0){
        // code promo existant
        this.isPromo=true;
        this.code=d[0];
      } else{
        this.isPromo=false;
        this.code={};
      }
    })
  }

  async subscribe(){
    if(this.isPromo){
      const alert = await this.alertController.create({
        subHeader: 'Vous avez déjà un code promo',
        header:'Code : '+this.code.code,
        message:"Vous avez parrainé "+this.code.son+" personne(s). Votre code a été créé le "+moment(this.code.created_at).format('DD/MM/YYYY'),
        buttons: [
          {
            text: 'Fermer',
            role: 'cancel',
          }
        ]
      });

      await alert.present();
    } else {
      const alert = await this.alertController.create({
        header: 'Code promo',
        message:"Entrez le code promo que vous souhaitez utiliser. Il doit faire minimum 6 caractères et maximum 8 caracteres, vous ne pouvez utiliser que des lettres et chiffres",
        inputs: [
          {
            placeholder: "Code Promo",
            type:'text',
            name:'code',
          }
        ],
        buttons: [
          {
            text: "Fermer",
            role: 'cancel',
          },
          {
            text: 'Confirmer',
            role:'confirm',
            handler:(data)=>{
              if(this.checkSpecialCharater(data.code)){
                this.checkCodePromo(data.code);
              } else {
                this.util.doToast('Veuillez entrer un code promo valide',3000);
              }
            }
          },
        ]
      });

      await alert.present();
    }
  }

  checkCodePromo(code){
    if(code!="" && code.length>5){
      const opt = {
        code
      };

      this.api.getList('promo_codes',opt).then((d:any)=>{
        if(d.length>0){
          this.util.doToast('Ce code promo est déjà utilisé',3000);
        } else {
          this.showLoading=true;
          // creation
          const o={
            code:code.toUpperCase(),
            user_id:this.user.id,
            status:'enable'
          };

          this.api.post('promo_codes',o).then(async (d:any)=>{
            this.code = d;
            this.isPromo=true;
            this.showLoading=false;
            const alert = await this.alertController.create({
              subHeader: 'Code promo créé',
              header:'Code : '+this.code.code,
              buttons: [
                {
                  text: 'Fermer',
                  role: 'cancel',
                }
              ]
            });

            await alert.present();
          }, q=>{
            this.showLoading=false;
            this.util.handleError(q);
          })
        }
      })
    } else {
      this.util.doToast("Code promo non valide. Le code promo doit avoir minimum 6 caractères et 8 maximum",3000);
    }

  }

  checkSpecialCharater(text) {
    if (text.split(" ").length > 1) {
      return false
    } else if (text.split(",").length > 1) {
      return false
    } else if (text.split(";").length > 1) {
      return false
    } else if (text.split("#").length > 1) {
      return false
    } else if (text.split("@").length > 1) {
      return false
    } else if (text.split("/").length > 1) {
      return false
    } else if (text.split("\\").length > 1) {
      return false
    } else if (text.split("\"").length > 1) {
      return false
    } else if (text.split("'").length > 1) {
      return false
    } else if (text.split("?").length > 1) {
      return false
    } else if (text.split("!").length > 1) {
      return false
    } else if (text.split("$").length > 1) {
      return false
    } else if (text.split("*").length > 1) {
      return false
    } else if (text.split("(").length > 1) {
      return false
    } else if (text.split(")").length > 1) {
      return false
    } else if (text.split("]").length > 1) {
      return false
    } else if (text.split("[").length > 1) {
      return false
    } else if (text.split("{").length > 1) {
      return false
    } else if (text.split("}").length > 1) {
      return false
    } else if (text.split("+").length > 1) {
      return false
    } else if (text.split("=").length > 1) {
      return false
    } else if (text.split("&").length > 1) {
      return false
    } else {
      return true
    }
  }

}
