import {Component, OnInit, ViewChild} from '@angular/core';
import {ApiProvider} from "../../providers/api/api";
import {Router} from "@angular/router";
import {AuthProvider} from "../../providers/auth/auth";
import {ModalEditUserComponent} from "../../components/modal-edit-user/modal-edit-user.component";
import {UtilProvider} from "../../providers/util/util";
import {TranslateService} from "@ngx-translate/core";
import {AlertController, IonModal, ModalController} from "@ionic/angular";

@Component({
  selector: 'app-user',
  templateUrl: './user.page.html',
  styleUrls: ['./user.page.scss'],
})
export class UserPage implements OnInit {
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
      });
    } else {
      this.router.navigate(['/home']);
    }
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

  transfert(){
    if(this.point>this.user.point || this.point<10000){
      this.util.doToast('Vous n\'avez pas assez de point, il vous faut minimum 10 000W pour initier un transfert',5000);
    } else {
      const opt = {
        phone:this.phone
      };
      this.api.getList('users',opt).then((d:any)=>{
        if(d.length>0){
          this.util.showLoading('Transfert encours');
          // utilisateur existant
          if(d[0].phone==this.user.phone){
            this.util.doToast('Vous ne pouvez pas vous transferer des points',4000);
          } else {
            const o = {
              point:this.point,
              phone:this.phone,
              password:this.password
            };
            const x = this.util.encryptAESData(o);
            this.api.post('transferts',{value:x}).then(d=>{
              this.util.hideLoading();
              this.closeModal();
              this.point=1;
              this.phone=null;
              this.password="";
              this.util.doToast('Transfert effectué',3000);
              this.user.point-=this.point;
              localStorage.setItem('user_ka',JSON.stringify(this.user));
            },(error:any)=>{
              const data = this.util.decryptAESData(JSON.stringify(error.response.data));
              alert(data);
              this.util.hideLoading();
            })
          }
        } else {
          this.util.doToast("Cet utilisateur n'existe pas",3000);
        }
      })
    }

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
              if(data.password.length>7){
                const opt={
                  email:data.email,
                  password:data.password,

                };
                this.auth.delete(opt).then((d:any)=>{
                  this.util.hideLoading();
                  this.util.doToast("account_delete",5000);
                  this.router.navigateByUrl('tabs');
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
                  current_password:data.current_password,
                  password_confirmation:data.password_confirmation,
                  password:data.password,

                };

                this.auth.update_info(opt).then((d:any)=>{
                  this.util.hideLoading();
                  this.util.doToast("password_updated",5000);
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

  askLanguage(){
    this.api.askLanguage();
  }

  modalTransfert(){
    document.getElementById('open-modalT').click();
  }

  logout(){
    this.auth.logout().then((d:any)=>{
      //this.router.navigateByUrl('home');
      this.router.navigateByUrl('home');
    })
  }

  historique(){
    this.router.navigateByUrl('user/history');
  }

  closeModal(){
    this.modal.setCurrentBreakpoint(0);
  }

  doRefresh(event) {
   this.ionViewWillEnter();

    setTimeout(() => {
      //console.log('Async operation has ended');
      event.target.complete();
    }, 500);
  }
  callKatika(){
    if(this.user.point<10000){
      this.util.doToast('Vous ne pouvez pas contacter le Katika si vos points sont inférieur à 10 000W. Jouez et terminez les 10 niveaux pour gagner la cagnottes',5000);
    } else {
      window.location.href="http://t.me/holyghost777";
    }
  }

  recharge(){
    window.location.href="https://api.whatsapp.com/send?phone=237653996540&text=Bonjour Katika, je souhaite recharger mon compte";
  }

  joinGroup(){
    window.location.href="http://t.me/holyghost777";
  }
}
