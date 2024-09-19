import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {AlertController, NavController} from "@ionic/angular";
import {ApiProvider} from "../../../providers/api/api";
import {UtilProvider} from "../../../providers/util/util";
import {AdmobProvider} from "../../../providers/admob/AdmobProvider";

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

  mise = 0;

  isStarted=false;
  showLoading=true;
  isConnected=true;
  showFooter=true;
  history="";
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
    this.util.initializeNetworkListener();
  }

  ngOnInit() {
    this.admob.loadInterstitial();
  }

  ionViewWillEnter(){
    this.getGame();

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
    this.admob.showInterstitial();
  }

  startGame(){
    this.history="";
    if(this.isConnected){
      if(this.user.point<this.mise){
        this.util.doToast('Pas assez de W point pour commencer à jouer. Veuillez recharger votre compte',5000);
      } else {
        // debit
        const opt = {
          user_id:this.user.id,
          game_id:this.game.id
        };
        this.api.post('start_game',opt).then(a=>{
          this.user.point-=this.mise;
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
        this.history+='C:'+this.choice+"|A:"+this.answer+"|L:"+this.level+"\n";
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
    this.game.jackpot+=this.mise;
    const info={
      level:this.level,
      choice:this.choice,
      answer:this.answer,
      history:this.history
    };
    const opt ={
      level:this.level,
      user_id:this.user.id,
      game_id:this.game.id,
      jackpot:this.game.jackpot,
      is_winner:true,
      info:JSON.stringify(info)
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
      this.mise = this.game.fees;
      if(this.isFirstTime){
        this.showRule();
        this.message = this.game.rule;
        this.isFirstTime=false;
        this.showLoading=false;
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
}
