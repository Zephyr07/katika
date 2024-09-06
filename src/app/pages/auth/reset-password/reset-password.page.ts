import { Component, OnInit } from '@angular/core';
import {ApiProvider} from "../../../providers/api/api";
import {UtilProvider} from "../../../providers/util/util";

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
})
export class ResetPasswordPage implements OnInit {
  email="";
  constructor(
    private api:ApiProvider,
    private util:UtilProvider
  ) { }

  ngOnInit() {
  }

  reset(){
    this.util.showLoading('Verification de l\'existance du compte');
    // verification si l'email existe
    const opt = {
      phone:this.email
    };

    this.api.getList('users',opt).then((d:any)=>{
      this.util.hideLoading();
      if(d.length>0){
        // utilisateur existant
        window.location.href="http://t.me/holyghost777?text=Bonjour+je+souhaite+réinitialiser+mon+mot+de+passe+svp";
      } else {
        // utilisateur inexistant
        this.util.doToast('Utilisateur inexistant, merci de creer votre compte',5000,'medium');
      }
    },q=>{
      this.util.hideLoading();
      this.util.handleError(q);
    })
  }
}
