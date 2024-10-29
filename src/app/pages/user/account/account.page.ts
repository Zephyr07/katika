import {Component, OnInit, ViewChild} from '@angular/core';
import {AlertController, IonModal, ModalController} from "@ionic/angular";
import {Router} from "@angular/router";
import {UtilProvider} from "../../../providers/util/util";
import {ApiProvider} from "../../../providers/api/api";
import {AuthProvider} from "../../../providers/auth/auth";
import {TranslateService} from "@ngx-translate/core";
import {ModalEditUserComponent} from "../../../components/modal-edit-user/modal-edit-user.component";

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit {

  @ViewChild(IonModal) modal: IonModal;
  user:any={};
  CANCEL="";
  UPDATE="";
  TEXT="";
  OLD_PASS="";
  PASSWORD="";
  PASS="";
  NEW_PASS="";
  DELETE="";
  CONFIRM_DELETE_TEXT="";
  country:any={};
  is_subscription=false;
  point=1;
  phone:number;
  password="";

  promo_code:any={};

  showLoading=true;

  constructor(
    private router:Router,
    private util:UtilProvider,
    private api:ApiProvider,
    private auth:AuthProvider,
    private alertController :AlertController,
    private modalController:ModalController,
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
  }

  ngOnInit() {
  }

  ionViewWillEnter(){

    if (this.api.checkUser()) {
      let user = JSON.parse(localStorage.getItem('user_ka'));
      this.api.getList('auth/me',{id:user.id}).then((a:any)=>{
        this.user = a.data.user;
        this.getPromoCode(user.id);
      },q=>{
        this.util.handleError(q);
        this.showLoading=false;
      });
    } else {
      this.util.doToast('Vous n\'êtes pas connecté',2000,'light');
      this.router.navigate(['/home']);
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
      this.showLoading=false;
    },q=>{
      this.util.handleError(q);
      this.showLoading=false;
    })
  }

  async editUser(o?:any){
    o=this.user;
    const modal = await this.modalController.create({
      component: ModalEditUserComponent,
      cssClass: 'my-custom-class',
      componentProps: {
        'objet': o
      }
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      this.user = JSON.parse(localStorage.getItem('user_ka'));
    } else {

    }
  }


  async askForRecharge(){
    const alert = await this.alertController.create({
      header: "Recharger le compte",
      subHeader:"Souhaitez-vous recharger votre compte?",
      buttons: [
        {
          text: "Non",
          role: 'cancel',
        },
        {
          text: "Oui",
          role:'confirm',
          handler:(data)=>{
            this.recharge();
          }
        },
      ],
    });

    await alert.present();
  }

  async deleteUser() {
    const alert = await this.alertController.create({
      header: this.DELETE,
      subHeader:this.CONFIRM_DELETE_TEXT,
      buttons: [
        {
          text: this.CANCEL,
          role: 'cancel',
        },
        {
          text: this.DELETE,
          role:'confirm',
          handler:(data)=>{
            //this.util.showLoading("updating");
            if(data.password!=""){
              if(data.password.length>5){
                const opt={
                  email:data.email,
                  password:data.password,

                };
                this.auth.delete(opt).then((d:any)=>{
                  this.util.hideLoading();
                  this.util.doToast("account_delete",5000);
                  this.router.navigateByUrl('home');
                })
              } else {
                this.util.hideLoading();
                this.util.doToast("error_password_1",5000);
              }

            } else {
              this.util.hideLoading();
              this.util.doToast('error_password_2',5000);
            }

          }
        },
      ],
      inputs: [
        {
          placeholder: 'Email',
          type:'email',
          name:'email'
        },
        {
          placeholder: this.PASSWORD,
          type:'password',
          name:'password',
          attributes: {
            minlength: 8,
          },
        }
      ],
    });

    await alert.present();
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      header: this.TEXT,
      buttons: [
        {
          text: this.CANCEL,
          role: 'cancel',
        },
        {
          text: this.UPDATE,
          role:'confirm',
          handler:(data)=>{
            //this.util.showLoading("updating");
            if(data.password_confirmation==data.password && data.current_password!=data.password){
              if(data.password.length>5){
                const opt={
                  id:this.user.id,
                  phone:this.user.phone,
                  email:this.user.email,
                  user_name:this.user.user_name,
                  current_password:data.current_password,
                  password_confirmation:data.password_confirmation,
                  password:data.password,

                };

                this.auth.update_info(opt).then((d:any)=>{
                  this.util.hideLoading();
                  this.util.doToast("password_updated",5000);
                  this.logout();
                })
              } else {
                this.util.hideLoading();
                this.util.doToast("error_password_1",5000);
              }

            } else {
              this.util.hideLoading();
              this.util.doToast('error_password_2',5000);
            }

          }
        },
      ],
      inputs: [
        {
          placeholder: this.OLD_PASS,
          type:'password',
          value:'',
          name:'current_password',
          attributes: {
            minlength: 6,
          },
        },
        {
          placeholder: this.PASS,
          type:'password',
          value:'',
          name:'password',
          attributes: {
            minlength: 6,
          },
        },
        {
          placeholder: this.NEW_PASS,
          type:'password',
          value:'',
          name:'password_confirmation',
          attributes: {
            minlength: 6,
          },
        }
      ],
    });

    await alert.present();
  }

  logout(){
    this.auth.logout().then((d:any)=>{
      //this.router.navigateByUrl('home');
      this.router.navigateByUrl('home');
    })
  }

  doRefresh(event) {
    this.ionViewWillEnter();

    setTimeout(() => {
      //console.log('Async operation has ended');
      event.target.complete();
    }, 500);
  }

  recharge(){
    window.location.href="http://t.me/katika_games?text=Bonjour je souhaite recharger mon compte, ci-apres mon nom d'utilisateur "+this.user.user_name;
  }

  joinGroup(){
    window.location.href="https://t.me/+vgMemP-Xj2o1ODhk";
  }

  showUser(){
    this.router.navigateByUrl('account');
  }

  showHome(){
    this.router.navigateByUrl('home');
  }

  showSetting(){
    this.router.navigateByUrl('setting');
  }
}
