import { Component, OnInit } from '@angular/core';
import {ApiProvider} from "../../../providers/api/api";
import {UtilProvider} from "../../../providers/util/util";
import {NUMBER_RANGE} from "../../../services/contants";
import {AlertController, Platform} from "@ionic/angular";
import * as _ from "lodash";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-withdrawal',
  templateUrl: './withdrawal.page.html',
  styleUrls: ['./withdrawal.page.scss'],
})
export class WithdrawalPage implements OnInit {

  showLoading=true;
  can_recharge=false;
  can_withdrawal=false;
  private user:any={};
  items=[];

  user_name="";
  user_point=0;


  CANCEL="";
  UPDATE="";
  TEXT="";
  OLD_PASS="";
  PHONE="";
  PASSWORD="";
  AMOUNT="";
  PASS="";
  NEW_PASS="";
  DELETE="";
  CONFIRM_DELETE_TEXT="";

  constructor(
    private api:ApiProvider,
    private util:UtilProvider,
    private platform:Platform,
    private alertController:AlertController,
    private translate:TranslateService
  ) {
    this.translate.get('cancel').subscribe( (res: string) => {
      this.CANCEL=res;
    });
    this.translate.get('update').subscribe( (res: string) => {
      this.UPDATE=res;
    });
    this.translate.get('old_password').subscribe( (res: string) => {
      this.OLD_PASS=res;
    });
    this.translate.get('password_confirmation').subscribe( (res: string) => {
      this.NEW_PASS=res;
    });
    this.translate.get('update_password').subscribe( (res: string) => {
      this.TEXT=res;
    });
    this.translate.get('new_password').subscribe( (res: string) => {
      this.PASS=res;
    });
    this.translate.get('password').subscribe( (res: string) => {
      this.PASSWORD=res;
    });
    this.translate.get('delete').subscribe( (res: string) => {
      this.DELETE=res;
    });
    this.translate.get('ask_password').subscribe( (res: string) => {
      this.CONFIRM_DELETE_TEXT=res;
    });
    this.translate.get('phone').subscribe( (res: string) => {
      this.PHONE=res;
    });
    this.translate.get('amount').subscribe( (res: string) => {
      this.AMOUNT=res;
    });
  }

  ngOnInit() {
  }


  ionViewWillEnter(){

    if (this.api.checkUser()) {
      let user = JSON.parse(localStorage.getItem('user_ka'));
      this.api.getList('auth/me',{id:user.id}).then((a:any)=>{
        this.user = a.data.user;
        this.user_name=this.user.user_name;
        this.user_point=this.user.point;
        this.getPaymentsAndWithdrawals(this.user.id);

        this.api.getSettings().then((d:any)=>{
          if(this.platform.is('ios')){
            this.can_recharge= d.ios.recharge=='enable';
            this.can_withdrawal= d.ios.withdrawal=='enable';
          } else {
            this.can_withdrawal= d.android.withdrawal=='enable';
            this.can_recharge= d.android.recharge=='enable';
          }
          this.showLoading=false;
        })
      });
    } else {
      this.util.doToast('Vous n\'êtes pas connecté',2000,'light');
      this.showLoading=false;
    }

  }

  getPaymentsAndWithdrawals(user_id){
    this.items=[];
    const  opt={
      should_paginate:false,
      user_id
    };
    let s = [];
    this.api.getList('payments',opt).then((d:any)=>{
      d.forEach(v=>{
        let status='';
        if(v.status==1){
          status='pending';
        } else if(v.status==2){
          status='submited';
        } else if(v.status==3){
          status='complete';
        } else if(v.status==4){
          status='failed';
        }
        s.push({
          amount:v.amount,
          status,
          date:v.updated_at
        })
      });

      this.api.getList('withdrawals',opt).then((d:any)=>{
        d.forEach(v=>{
          s.push({
            amount:-v.amount,
            comment:v.comment,
            status:v.status,
            date:v.updated_at
          })
        })

        // classement par date
        s = _.orderBy(s,'date').reverse();

        this.items=s;
      })


    })
  }

  async recharge() {
    if(this.can_recharge){
      const alert = await this.alertController.create({
        header: this.TEXT,
        message:"Entrez le numéro mobile money et le nombre de point que vous souhaitez recharger. La recharge minimum est de 1 000.",
        buttons: [
          {
            text: this.CANCEL,
            role: 'cancel',
          },
          {
            text: "Confirmer",
            role:'confirm',
            handler:(data)=>{
              if(!isNaN(data.phone) && data.phone <= NUMBER_RANGE.max && data.phone >= NUMBER_RANGE.min){
                if(data.amount>=1000){
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
                      this.ionViewWillEnter();
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
                  this.util.doToast('Le montant doit être supérieur ou égale à 1 000',3000);
                }

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

  async withdrawal() {
    if(this.can_withdrawal){
      const alert = await this.alertController.create({
        header: 'Retrait',
        message:"Entrez le numéro mobile money qui va recevoir le retrait et le nombre de point que vous souhaitez retirer. Le retrait minimum est de 10 000 points. Le temps de traitement des retraits est de 72h et les frais de retraits sont de 5% du montant.",
        inputs: [
          {
            placeholder: "Points",
            type:'number',
            name:'amount',
            attributes: {
              step:100,
              min: 10000
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
        buttons: [
          {
            text: this.CANCEL,
            role: 'cancel',
          },
          {
            text: 'Confirmer',
            role:'confirm',
            handler:(data)=>{
              if(!isNaN(data.phone) && data.phone <= NUMBER_RANGE.max && data.phone >= NUMBER_RANGE.min){
                if(data.amount>=10000){
                  this.util.showLoading("treatment");
                  const opt = {
                    amount:data.amount,
                    phone:data.phone,
                    user_id:this.user.id,
                    comment:'Initialisation du retrait'
                  };
                  this.api.post('withdrawals',opt).then((d:any)=>{
                    this.util.hideLoading();
                    this.ionViewWillEnter();
                  },q=>{
                    this.util.hideLoading();
                    this.util.handleError(q);
                  });
                } else {
                  this.util.doToast('Le montant doit être supérieur ou égale à 10 000',3000);
                }

              } else {
                this.util.doToast('Veuillez entrer un numéro de téléphone valide',3000);
              }
            }
          },
        ]
      });

      await alert.present();
    } else {
      window.location.href="http://t.me/leGrand_k?text=Bonjour je souhaite recharger mon compte, ci-apres mon nom d'utilisateur "+this.user.user_name;
    }

  }

}
