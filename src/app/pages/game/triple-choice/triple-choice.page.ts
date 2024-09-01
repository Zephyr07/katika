import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {AlertController, NavController} from "@ionic/angular";
import {ApiProvider} from "../../../providers/api/api";
import {UtilProvider} from "../../../providers/util/util";
import {AdmobProvider} from "../../../providers/admob/AdmobProvider";
import {Network, NetworkStatus} from "@capacitor/network";

@Component({
  selector: 'app-triple-choice',
  templateUrl: './triple-choice.page.html',
  styleUrls: ['./triple-choice.page.scss'],
})
export class TripleChoicePage implements OnInit {
  choice=99999;
  answer = 0;
  level=1;
  size=6;
  is_loose = false;
  is_win = false;
  is_user = false;
  is_subscription = false;
  user:any={};

  game:any={};

  isStarted=false;
  isConnected=true;
  showFooter=true;
  titre="";
  message="";
  showMessage=false;
  isFirstTime=true;

  constructor(
    private navCtrl:NavController,
    private alertController : AlertController,
    private util : UtilProvider,
    private admob : AdmobProvider,
    private api : ApiProvider
  ) {
    this.initializeNetworkListener();
  }

  ngOnInit() {


  }

  ionViewWillEnter(){
    this.getGame();
    this.admob.loadInterstitial();
    this.admob.showBanner('top',80);

    if(this.api.checkUser()){
      this.is_user=true;
      this.user=JSON.parse(localStorage.getItem('user_ka'));
      this.is_subscription= this.user.is_subscription;
      this.api.getList('auth/me',{id:this.user.id}).then((a:any)=>{
        this.user = a.data.user;
        this.is_subscription = this.api.checkSubscription(this.user.subscription).is_actived;
        this.user.is_subscription=this.is_subscription;
        localStorage.setItem('user_ka',JSON.stringify(this.user));
      });
    } else {
      this.is_user=false;
    }
  }

  ionViewWillLeave(){
    this.admob.hideBanner();
  }

  startGame(){
    if(this.isConnected){
      if(this.user.point<50){
        this.util.doToast('Pas assez de W point pour commencer à jouer. Veuillez recharger votre compte',5000);
      } else {
        // debit
        const opt = {
          user_id:this.user.id,
          game_id:this.game.id
        };
        this.api.post('start_game',opt).then(a=>{
          this.user.point-=50;
          this.level = 1;
          this.choice=99999;
          this.setAnswer();
          this.is_loose=false;
          this.isStarted=true;
          this.showFooter=false;
        });
      }
    } else {
      this.showMessage=true;
      this.titre="Vous n'êtes pas connecté";
      this.message="Connectez-vous à internet pour continuer à jouer";
    }
  }

  checkChoice(t){
    if(this.isStarted){
      if(!this.is_loose){
        this.choice = t;
        if(this.answer ==t){
          setTimeout(()=>{
            // win, passage au niveau suivant
            if(this.level==10){
              // win
              this.win();
              this.is_win=true;
            } else {
              this.level++;
              if(this.level==5){
                this.admob.showInterstitial().then(da=>{
                  this.admob.loadInterstitial()
                });
              }
              this.setAnswer();
              this.choice=0;
            }
          },700)
        } else{
          //this.level=1;
          this.loose();
        }
      }
    } else {
      this.titre = "La partie n'a pas encore commencé";
      this.message ="Cliquer sur jouer pour commencer à jouer";
      this.showMessage=true;
    }


  }

  setAnswer(){
    let a = 1;
    let b = 2;
    if(this.level <3){
      b = 2;
    } else if(this.level>2 && this.level<6){
      b=3;
    } else if(this.level>5 && this.level<9){
      b= 4
    } else {
      b=5;
    }

    let min = Math.ceil(a);
    let max = Math.floor(b);
    this.answer = Math.floor(Math.random() * (max - min + 1)) + min;
  }

  async loose(){
    this.isStarted=false;
    this.is_loose = true;
    this.titre = "Vous avez perdu";
    this.message ="Pas de chance, peut-être une prochaine fois 😭😭😭";
    this.showMessage=true;
    this.showFooter=true;
    this.ionViewWillEnter();
  }

  async win(){
    this.game.jackpot+=50;
    const opt ={
      level:this.level,
      user_id:this.user.id,
      game_id:this.game.id,
      jackpot:this.game.jackpot,
      is_winner:true
    };

    this.titre = "VOUS AVEZ GAGNEZ !!!";
    this.message ="Vous avez gagnez "+opt.jackpot+" W. Vos points ont été crédités sur votre compte";
    this.showMessage=true;
    this.showFooter=true;

    this.api.post('scores',opt).then(d=>{
      this.ionViewWillEnter();
    });

  }


  async play(){
    this.level = 1;
    this.choice=99999;
    this.setAnswer();
    this.is_loose=false;
  }

  close(){
    this.admob.showInterstitial();
    this.navCtrl.navigateRoot('/game');
  }

  becomeMember(){
    this.navCtrl.navigateRoot('/user');
  }

  login(){
    this.navCtrl.navigateRoot('/login');
  }

  getGame(){
    const opt={
      name:'Bats à 10'
    };
    this.api.getList('games',opt).then((d:any)=>{
      this.game=d[0];
      if(this.isFirstTime){
        this.showRule();
        this.message = this.game.rule;
        this.isFirstTime=false;
      }
    },q=>{
      this.util.handleError(q);
    })
  }

  showRule(){
    this.titre=this.game.name;
    this.message=this.game.rule;
    this.showMessage=true;
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
        this.isConnected=false;
        this.showMessage=true;
        this.titre="Vous n'êtes pas connecté";
        this.message="Connectez-vous à internet pour continuer à jouer";
        console.log('Vous avez perdu la connexion Internet.');
        // Ajoute une notification pour l'utilisateur ici si nécessaire
      } else {
        this.isConnected=true;
        this.showMessage=true;
        this.titre="Connexion retablie";
        this.message="Vous pouvez continuer à jouer";
        console.log('Connexion Internet restaurée.');
        // Ajoute une notification pour l'utilisateur ici si nécessaire
      }
    });
  }
}
