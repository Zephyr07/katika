import {Component, OnInit, ViewChild} from '@angular/core';
import {IonModal, NavController} from "@ionic/angular";
import {ApiProvider} from "../../providers/api/api";
import {UtilProvider} from "../../providers/util/util";
import {NavigationExtras, Router} from "@angular/router";
import {AuthProvider} from "../../providers/auth/auth";
import {Camera, CameraResultType, CameraSource} from "@capacitor/camera";
import {Device} from "@capacitor/device";
import {NUMBER_RANGE} from "../../services/contants";
import {AdmobProvider} from "../../providers/admob/AdmobProvider";
import {environment} from "../../../environments/environment";
import {Network, NetworkStatus} from "@capacitor/network";

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  @ViewChild(IonModal) modal: IonModal;
  user_name="";
  phone:any;
  MIN = NUMBER_RANGE.min;
  MAX = NUMBER_RANGE.max;
  email="";
  password="";
  password_confirmation="";
  scores:any=[];
  version = environment.version;
  promo_code:any={};
  code="";
  promo_code_id:number;
  target:number;
  jackpot:number;
  devise="W";
  lang="";
  choice="c";

  showLoading=true;

  user:any={
  };

  is_user=true;

  titre="";
  message="";
  showMessage=false;

  constructor(
    private router:Router,
    private api:ApiProvider,
    private auth:AuthProvider,
    private util:UtilProvider,
    private navCtrl:NavController,
  ) {
    this.util.initializeNetworkListener();
    Device.getLanguageCode().then(d=>{
      this.lang=d.value;
    });
  }

  ngOnInit() {
    if(this.api.checkCredential()){
      //this.util.showLoading('login');
      // connexion
      const cre = this.util.decryptAESData(JSON.parse(localStorage.getItem('auth_ka')));
      this.auth.login(cre).then((d:any)=>{
        if(d.user.status=='pending_activation'){
          this.navCtrl.navigateRoot(['/activated-account']);
        } else if(d.user.status=='enable') {
          localStorage.setItem('is_user','true');
          this.is_user=true;
          this.user = {
            user_name:d.user.user_name,
            point:d.user.point
          };
        } else {
          this.util.doToast('Votre compte est désactivé. Contacter le support au +237 673996540',5000, 'warning');
        }

      },q=>{
        this.auth.logout();
        this.is_user=false;
      })

    } else {
      localStorage.setItem('is_user','false');
      this.is_user=false
    }
  }

  ionViewWillEnter(){
    this.api.getSettings().then((d:any)=>{
      if(d){
        this.target = d.target;
        this.jackpot = d.jackpot;
        this.devise = d.devise;
      }
    });
    this.getScores();
    if(!this.api.checkCredential()){
      this.is_user=false;
    }

    if(this.api.checkUser()){
      this.is_user=true;
      this.user=JSON.parse(localStorage.getItem('user_ka'));
      this.api.getList('auth/me',{id:this.user.id}).then((a:any)=>{
        this.user = a.data.user;
        localStorage.setItem('user_ka',JSON.stringify(this.user));
      },q=>{
        this.util.handleError(q);
      });
    } else {
      this.is_user=false;
    }
  }

  games(){
    if(this.is_user){
      this.router.navigateByUrl('game');
    } else {
      this.connexion();
    }
  }

  getScores(){
    this.scores=[];
    const opt={
      _sortDir:'desc'
    };

    this.api.getList('hit',opt).then((d:any)=>{
      let i = 1;
      for (const s in d) {
        if (d.hasOwnProperty(s)) {
          this.scores.push(
            {
              rank:i,
              user_name:s,
              point:d[s]
            }
          );
          i++;
        }
      }
      this.showLoading=false;
      //console.log(d);
    }, q=>{
      this.showLoading=false;
      this.util.hideLoading();
      this.util.handleError(q);
    })
  }

  checkCodePromo(){
    if(this.code!="" && this.code.length>3){
      const opt = {
        code:this.code
      };

      this.api.getList('promo_codes',opt).then((d:any)=>{
        if(d.length>0){
          this.promo_code = d[0];
          this.promo_code_id = d[0].id;
        } else {
          this.util.doToast('Ce code promo n\'existe pas',3000);
        }
      })
    }

  }

  showUser(){
    if(this.is_user){
      this.router.navigateByUrl('account');
    } else {
      this.router.navigateByUrl('login');
    }
  }

  showDashboard(){
    let user=JSON.parse(localStorage.getItem('user_ka'));
    if(user.phone=='696870700'){
      this.router.navigateByUrl('dashboard');
    } else {

    }
  }

  showSetting(){
    this.router.navigateByUrl('setting');
  }

  closeModal(){
    this.modal.setCurrentBreakpoint(0);
  }


  register() {
    this.user_name = this.user_name.trim();
    if(this.checkForm()){
      if(this.checkSpecialCharater(this.user_name)){
        if(isNaN(parseInt(this.user_name))){
          this.util.showLoading('register');
          const opt={
            user_name:this.util.capitalize(this.user_name.trim()),
            email:this.email.trim(),
            phone:this.phone,
            password:this.password,
            promo_code_id:0,
            settings:JSON.stringify([{"language":this.lang},{"notification":"true"}]),
            password_confirmation:this.password_confirmation
          }

          if(this.promo_code_id!=undefined && this.promo_code_id>0){
            opt.promo_code_id = this.promo_code_id;
          } else {
            delete opt.promo_code_id;
          }

          this.auth.register(opt).then((d:any)=>{
            this.util.hideLoading();
            this.user = {
              user_name:d.user.user_name,
              point:d.user.point
            };
            localStorage.setItem('user_game',JSON.stringify(d.user));
            this.util.doToast('Inscription reussi, vous devez activer votre compte maintenant',5000);
            this.navCtrl.navigateRoot(['/activated-account']);
            this.closeModal();

            // verification si le user a déjà un store
            this.is_user=true;


          }, q=>{
            this.util.hideLoading();
            this.util.handleError(q);
          })
        } else {
          // le nom d'utilisateur est entièrement un chiffre
          this.util.doToast('Le nom d\'utilisateur ne peut pas etre un nombre',1000,'light')
        }
      }

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


    if(!this.checkSpecialCharater(this.user_name) || this.user_name==''){
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

  connexion(){
    document.getElementById("open-modalC").click();
  }

  login(){
    if (!isNaN(this.phone) && (this.phone<NUMBER_RANGE.min || this.phone>NUMBER_RANGE.max)){
      this.util.doToast("phone_empty",5000)
    } else if (this.password == "" || this.password.length<6){
      this.util.doToast("password_empty",5000)
    } else {
      this.util.showLoading('identification');
      this.auth.login({email:this.phone,password:this.password}).then((d:any)=>{
        this.user = {
          user_name:d.user.user_name,
          point:d.user.point,
          image:d.user.image,
        };
        this.is_user = true;

        this.util.hideLoading();
        localStorage.setItem('is_user','true');
        this.closeModal();
        //this.navCtrl.navigateRoot(['/home']);
        if(d.user.status=='pending_activation'){
          this.navCtrl.navigateRoot(['/activated-account']);
        } else if(d.user.status=='enable') {
        } else {
          this.util.doToast('Votre compte est désactivé. Contacter le support au +237 673996540',5000, 'warning');
        }
      }, q=>{
        this.util.doToast('Numéro ou mot de passe incorrect',3000,'light');
      })
    }
    //localStorage.setItem('uid','rahul');

  }

  doRefresh(event) {
    this.ionViewWillEnter();
    this.ngOnInit();

    setTimeout(() => {
      //console.log('Async operation has ended');
      event.target.complete();
    }, 500);
  }

  closeMessage(event: string){
    this.showMessage=false;
  }

  goToReset(){
    this.modal.setCurrentBreakpoint(0);
    this.router.navigateByUrl('reset-password');
  }
}
