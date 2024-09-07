import { Component, OnInit } from '@angular/core';
import {UtilProvider} from "../../../providers/util/util";
import {AuthProvider} from "../../../providers/auth/auth";
import {NavController} from "@ionic/angular";
import {ApiProvider} from "../../../providers/api/api";

@Component({
  selector: 'app-activated-account',
  templateUrl: './activated-account.page.html',
  styleUrls: ['./activated-account.page.scss'],
})
export class ActivatedAccountPage implements OnInit {
  private user:any={};
  is_loading=false;
  code:any=null;
  email="";

  constructor(
    private util:UtilProvider,
    private auth:AuthProvider,
    private api:ApiProvider,
    private navCtrl:NavController,
  ) {

  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.user = JSON.parse(localStorage.getItem('user_ka'));
    this.email = this.user.email;
  }

  active() {
    if(this.code<100000 || this.code >999999){
      this.util.doToast('Erreur sur le code d\'activation',3000,'light');
    } else {
      this.util.showLoading('Activation');
      const opt ={
        code:this.code,
        user_id:this.user.id
      };
      this.auth.activate(opt).then(d=>{
        this.util.doToast("Compte activé",5000,'tertiary');
        this.util.hideLoading();
        this.navCtrl.navigateRoot(['/home']);

      }, q=>{
        this.util.hideLoading();
        this.util.doToast('Erreur sur le code d\'activation',3000,'light');
        this.util.handleError(q);
      })
    }

  }

  contactUs(){
    window.location.href="http://t.me/holyghost777?text=Bonjour+je+n'ai+pas+reçu+le+code+pour+activer+mon+compte.+Mon+mail:"+this.email;
  }

  resendCode(){
    this.api.getList('send_code',{email:this.email}).then(d=>{
      this.util.doToast("Le code a été envoyé à votre adresse mail",3000,'light');
    })
  }

}
