import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {UtilProvider} from "../util/util";
import * as moment from "moment";
import {ActionSheetController, AlertController} from "@ionic/angular";
import {TranslateService} from "@ngx-translate/core";

import {API_ENDPOINT, NUMBER_RANGE} from "../../services/contants";
import * as _ from "lodash";
import axios from "axios";


/*
  Generated class for the ApiProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/

export const http = axios.create({
  baseURL: API_ENDPOINT,
});

http.defaults.headers['Authorization'] = "Bearer "+localStorage.getItem('jwt_token');
http.interceptors.response.use((res:any) =>{
  let newResponse:any=undefined;
  if (Array.isArray(res.data)) {
    return res.data;
  }
  if (res.data.per_page !== undefined) {
    newResponse = res.data.data;
    newResponse.metadata = _.omit(res.data, 'data');
    return newResponse;
  }

  return res.data;
});

@Injectable()
export class ApiProvider {

  public date_format = 'Y-M-D';
  private TEXT="";
  private DELETE_TITLE="";
  private DELETE="";
  private NO="";
  private YES="";
  private CANCEL="";
  private UPDATE="";
  private PHONE="";
  private AMOUNT="";
  public autoplay_val = 5000;
  public slide_speed = 700;

  constructor(
    private router: Router,
    private alertController: AlertController,
    private actionSheetController: ActionSheetController,
    private translate:TranslateService,
    private util:UtilProvider
  ) {

    this.translate.get('recharge_account').subscribe( (res: string) => {
      this.TEXT=res;
    });
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
    this.translate.get('delete_title').subscribe( (res: string) => {
      this.DELETE_TITLE=res;
    });
    this.translate.get('yes').subscribe( (res: string) => {
      this.YES=res;
    });
    this.translate.get('no').subscribe( (res: string) => {
      this.NO=res;
    });
    this.translate.get('deleted').subscribe( (res: string) => {
      this.DELETE=res;
    });
  }

  public getList(target:string,data?:any){
    return new Promise((resolve, reject) => {
      if(data){
        http.get(target,{params:data}).then(d=>{
          resolve(d);
        }, q=>{
          reject(q);
        });
      } else {
        http.get(target).then(d=>{
          resolve(d);
        }, q=>{
          reject(q);
        })
      }
    })
  }

  public get(target:string,id:number,data?:any){
    return new Promise((resolve, reject) => {
      if(data){
        http.get(target+'/'+id,{params:data}).then(d=>{
          resolve(d);
        }, q=>{
          reject(q);
        });
      } else {
        http.get(target+'/'+id).then(d=>{
          resolve(d);
        }, q=>{
          reject(q);
        })
      }
    })
  }

  public post(target:string,data:any,is_crypt?:boolean){
    return new Promise((resolve, reject) => {
      let crypt = this.util.encryptAESData(data);
      if(is_crypt && is_crypt==true){
        crypt = data;
      }
      //let crypt = this.util.encryptAESData(data);
      http.post(target,{value:crypt}).then(d=>{
        console.log(target);
        let data = this.util.decryptAESData(JSON.stringify(d));
        if(is_crypt && is_crypt==true){
          data = d;
        }
        resolve(data);
      }, q=>{
        reject(q);
      });
    })
  }

  public put(target:string,id:number,data:any){
    return new Promise((resolve, reject) => {
      let crypt = this.util.encryptAESData(data);
      http.put(target+'/'+id,crypt).then(d=>{
        resolve(d);
      }, q=>{
        reject(q);
      });
    })
  }

  public remove(target:string,id:number){
    return new Promise((resolve, reject) => {
      http.delete(target+'/'+id).then(d=>{
        resolve(d);
      }, q=>{
        reject(q);
      });
    })
  }

  checkUser() {
    if(localStorage.getItem('user_ka')!='undefined' || localStorage.getItem('user_ka')!='null' || localStorage.getItem('user_ka')!=undefined){
      if (JSON.parse(localStorage.getItem('user_ka')) == null) {
        //Metro.notify.create('Vous n\'êtes pas connecté', 'Erreur de connexion', {cls: 'alert'});
        //this.router.navigate(['/login']);
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }

  }

  checkCredential() {
    if(localStorage.getItem('auth_ka')!='undefined' || localStorage.getItem('auth_ka')!='null' || localStorage.getItem('auth_ka')!=undefined){
      if (JSON.parse(localStorage.getItem('auth_ka')) == null) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }

  }

  async rechargeAccount(fees,user_id) {
    let text = "Recharger votre compte de "+fees+"U. Entrer le numéro pour le paiement mobile";
    const alert = await this.alertController.create({
      header: this.TEXT,
      subHeader: text,
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
                type:'account',
                amount:data.amount,
                user_id
              };
              this.post('init_buy_account',opt).then(async (d:any) => {
                // initialisation du payment my-coolPay
                this.post('payment/' + d.id + '/' + data.phone,{}).then(e=>{
                  this.util.hideLoading();
                  this.util.doToast('payment_pending',5000);
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
          value:fees,
          attributes: {
            step:50,
            min: 0
          },
        },
        {
          placeholder: this.PHONE,
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
  }

  checkSubscription(s:any){
    let status = {
      is_subscription:false,
      is_actived:false,
      is_paid:false
    }
    if(s!=undefined){
      status.is_subscription=true;
      if(s.state==0 || s.state=='paid' || s.state=='active'){
        // payé
        status.is_paid=true;
        let now = moment();
        let start_at = moment(s.start_at);
        let created_at = moment(s.created_at);
        //console.log(start_at.add(s.duration,'month').format("YY MM DD"),now.format("YY MM DD"));
        if(start_at.add(s.pack.duration,'month')>now && created_at.add(s.pack.duration,'month')>now){
          // activé
          status.is_actived=true;
        }
      }
    }
    localStorage.setItem('subscription_status', JSON.stringify(status));
    return status;
  }


  saveImage(image,objetClass,object_parent_id,text,toast?:boolean,call?){
    image.append('_method', 'POST');

    image.append('product_variant_id',object_parent_id);
    this.post(objetClass,image).then(da=>{
      if(!toast){
        this.util.doToast(text,3000);
      }
      if(call){
        call();
      }
      return true;
    }, q => {
      this.util.handleError(q);
    });
  }

  updateImage(image,objetClass,objet,text,toast?:boolean,call?){
    image.append('_method', 'PUT');
    let id = objet.id;
    if(objet.body){
      id = objet.body.id;
    }
    image.append('id',id);
    this.post(objetClass+'/' + id,image).then(d=>{
      if(!toast){
        this.util.doToast(text,5000);
      }
      if(call){
        call();
      }
      return true;
    }, q => {
      this.util.handleError(q);
    });

    /*this.restangular.all(objetClass+'/' + id).customPOST(image, undefined, undefined, {'Content-Type': undefined}).subscribe((da:any) => {
      if(!toast){
        this.util.doToast(text,3000);
      }
      if(call){
        call();
      }
      return true;
    }, q => {
      this.util.handleError(q);
    });*/
  }

  deleteItem(i,classObject, item){
    return new Promise(async (resolve, reject) => {
      const alert = await this.alertController.create({
        //cssClass: 'my-custom-class',
        message: this.DELETE_TITLE,
        buttons: [
          {
            text: this.NO,
            role: 'cancel',
            handler: (blah) => {

            }
          },
          {
            text: this.YES,
            role: 'confirm',
            handler: (blah) => {
              this.util.showLoading('deleting');
              this.remove(classObject,i.id).then((d:any)=>{
                this.util.hideLoading();
                let texte = item;
                if (i.name) {
                  texte += ' ' + i.name + " " + this.DELETE;
                } else if (i.full_name) {
                  texte += ' ' + i.full_name + " " + this.DELETE;
                } else {
                  texte += ' ' + i.title + " " + this.DELETE
                }

                this.util.doToast(texte, 3000);
                resolve(d);
              }, q => {
                this.util.hideLoading();
                this.util.handleError(q);
                reject(q);
              })

            }
          }
        ]
      });
      await alert.present();
    })
  }

  async postData(url = '', data = {}) {
    // Default options are marked with *
    const response = await fetch(url, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return response.json(); // parses JSON response into native JavaScript objects
  }

  getSettings(){
    return new Promise((resolve, reject) => {
      this.getList('settings').then(d=>{
        localStorage.setItem('ka_settings',JSON.stringify(JSON.parse(d[0].config)[0]));
        resolve(JSON.parse(d[0].config)[0]);
      }, q=>{
        reject(q);
      });
    })
  }

  async askLanguage() {
    let is_log=false;
    let user:any={};
    if(this.checkCredential()){
      is_log=true;
      user=JSON.parse(localStorage.getItem('user_ka'));
    }
    const actionSheet = await this.actionSheetController.create({
      header: 'Langue/Language',
      cssClass: 'my-custom-class',
      buttons: [{
        text: 'Français',
        handler: () => {
          this.translate.use('fr');
          this.translate.setDefaultLang('fr');
          moment.locale('fr');
          if(is_log){
            // update setting
            this.update_settings({language:'fr'});
          }
        }
      },{
        text: 'English',
        handler: () => {
          this.translate.use('en');
          this.translate.setDefaultLang('fr');
          moment.locale('en');
          if(is_log){
            // update setting
            this.update_settings({language:'en'});
          }
        }
      }]
    });
    await actionSheet.present();

    const { role, data } = await actionSheet.onDidDismiss();
    //console.log('onDidDismiss resolved with role and data', role, data);
  }

  update_settings(credentials: {
    language?:string,notification?:boolean}) {
    let settings=[];
    if(credentials.language){
      settings.push({"language":credentials.language})
    }
    if(credentials.notification){
      settings.push({"notification":credentials.notification})
    }
    return new Promise((resolve, reject) => {
      this.post('auth/update_settings',{settings:JSON.stringify(settings)})
        .then((response:any) => {
          const data = response.data;
          resolve(data);
        }, function(error) {
          // //console.log(error);

          reject(error);
        });
    });

  }

}
