import {Component, OnInit, ViewChild} from '@angular/core';
import {IonModal} from "@ionic/angular";
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

  target:number;
  lang="";
  choice="c";

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
  ) {
    this.initializeNetworkListener();
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
        localStorage.setItem('is_user','true');
        this.is_user=true;
        this.user = {
          user_name:d.user.user_name,
          point:d.user.point
        };
      },q=>{
        this.auth.logout();
        this.is_user=false;
      })

    } else {
      localStorage.setItem('is_user','false');
      // l'utilisateur n'existe pas
      this.is_user=false;
      //this.navCtrl.navigateRoot(['/login']);
    }
  }

  ionViewWillEnter(){
    this.api.getSettings().then((d:any)=>{
      if(d){
        this.target = d.target;
      }
    });
    this.getScores();
    if(!this.api.checkCredential()){
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
      //console.log(d);
    }, q=>{
      this.util.hideLoading();
      this.util.handleError(q);
    })
  }

  showUser(){
    this.router.navigateByUrl('user');
  }

  closeModal(){
    this.modal.setCurrentBreakpoint(0);
  }


  register() {
    if(this.checkForm()){
      this.util.showLoading('register');
      const opt={
        user_name:this.util.capitalize(this.user_name.trim()),
        email:this.email.trim(),
        phone:this.phone,
        password:this.password,
        settings:JSON.stringify([{"language":this.lang},{"notification":"true"}]),
        password_confirmation:this.password_confirmation
      }
      this.auth.register(opt).then((d:any)=>{
        this.util.hideLoading();
        this.user = {
          user_name:d.user.user_name,
          point:d.user.point
        };
        localStorage.setItem('user_game',JSON.stringify(d.user));
        this.util.doToast('Inscription reussi, vous pouvez jouer',5000);
        this.closeModal();

        // verification si le user a déjà un store
        this.is_user=true;


      }, q=>{
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
      }, q=>{
        alert(JSON.stringify(q));
        this.util.hideLoading();
        this.util.handleError(q);
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

  async initializeNetworkListener() {
    // Vérifier l'état initial du réseau
    const status: NetworkStatus = await Network.getStatus();

    // Écouter les changements de connexion
    Network.addListener('networkStatusChange', (status) => {
      //console.log('Changement de l’état du réseau:', status);

      if (!status.connected) {
        this.showMessage=true;
        this.titre="Vous n'êtes pas connecté";
        this.message="Connectez-vous à internet pour continuer à jouer";
        // Ajoute une notification pour l'utilisateur ici si nécessaire
      } else {
        this.showMessage=true;
        this.titre="Connexion retablie";
        this.message="Vous pouvez continuer à jouer";
        // Ajoute une notification pour l'utilisateur ici si nécessaire
      }
    });
  }
}
