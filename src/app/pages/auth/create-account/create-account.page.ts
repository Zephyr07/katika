import { Component, OnInit } from '@angular/core';
import {UtilProvider} from "../../../providers/util/util";
import {AuthProvider} from "../../../providers/auth/auth";
import {ApiProvider} from "../../../providers/api/api";
import {Router} from "@angular/router";
import {MenuController, NavController} from "@ionic/angular";
import {NUMBER_RANGE} from "../../../services/contants";
import {isCordovaAvailable} from "../../../services/utils";
import {Device} from "@capacitor/device";

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.page.html',
  styleUrls: ['./create-account.page.scss'],
})
export class CreateAccountPage implements OnInit {

  NUMBER_RANGE=NUMBER_RANGE;
  is_loading=false;
  email:any="";
  password="";
  password_confirmation="";
  user_name="";
  store_code="";
  full_name="";
  private lang="";
  phone:number;

  constructor(
    private util:UtilProvider,
    private auth:AuthProvider,
    private api:ApiProvider,
    private router:Router,
    private navCtrl:NavController,
    private menuController : MenuController
  ) {
    this.menuController.enable(false);
  }


  ngOnInit() {
    Device.getLanguageCode().then(d=>{
      this.lang=d.value;
    });
  }

  register() {
    if(this.checkForm()){
      this.util.showLoading('register');
      const opt={
        full_name:this.full_name.trim(),
        user_name:this.user_name.trim(),
        email:this.email.trim(),
        phone:this.phone,
        store_code:this.store_code.trim(),
        password:this.password,
        settings:JSON.stringify([{"language":this.lang},{"notification":"true"}]),
        password_confirmation:this.password_confirmation
      }
      this.auth.register(opt).then((d:any)=>{
        if(isCordovaAvailable()){
          //OneSignal.sendTags({'country_id':d.user.country_id});
        }
        this.util.hideLoading();
        localStorage.setItem('user_ka',JSON.stringify(d.user));

        // verification si le user a déjà un store
        if(d.user.store_users!=null){
          this.navCtrl.navigateRoot(['/home']);
        } else {
          this.navCtrl.navigateRoot(['/store-add']);
        }

      }, q=>{
        alert(JSON.stringify(q));
        this.util.hideLoading();
        this.util.handleError(q);
      })
    }
    //localStorage.setItem('uid','rahul');

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

  checkForm(){
    let check_email=false;
    if(this.email!=null){
      const opt = this.email.split('@');
      if(opt.length==2){
        const tmp = opt[1].split('.');
        check_email = tmp.length >= 2;
      } else {
        check_email= false;
      }
    }


    if(this.full_name==null || this.full_name==''){
      this.util.doToast("Erreur sur le nom complet",3000, 'danger');
      return false;
    } else if(!this.checkSpecialCharater(this.user_name) || this.full_name==''){
      this.util.doToast("Erreur sur le nom d'utilisateur",3000, 'danger');
      return false;
    } else if (isNaN(this.phone)){
      this.util.doToast("Erreur sur le numéro de téléphone",3000, 'danger');
      return false;
    } else if (!isNaN(this.phone) && (this.phone<NUMBER_RANGE.min || this.phone>NUMBER_RANGE.max)){
      this.util.doToast("Le numéro doit être compris entre 620 000 000 et 699 999 99",3000, 'danger');
      return false;
    } else if (this.email==null || this.email==''){
      this.util.doToast("Erreur sur l'email",3000, 'danger');
      return false;
    } else if (!check_email){
      this.util.doToast("Erreur sur l'email",3000, 'danger');
      return false;
    } else if (this.password.length<8){
      this.util.doToast("Le mot de passe doit contenir 8 caractères",3000, 'danger');
      return false;
    } else {
      return true
    }
  }

  goToLogin(){
    this.router.navigateByUrl('login');
  }
}
