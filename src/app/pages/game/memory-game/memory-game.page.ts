import { Component, OnInit } from '@angular/core';
import {AlertController, NavController} from "@ionic/angular";
import {ApiProvider} from "../../../providers/api/api";
import * as _ from "lodash";
import {UtilProvider} from "../../../providers/util/util";
import {AdmobProvider} from "../../../providers/admob/AdmobProvider";
import {Network, NetworkStatus} from "@capacitor/network";

@Component({
  selector: 'app-memory-game',
  templateUrl: './memory-game.page.html',
  styleUrls: ['./memory-game.page.scss'],
})
export class MemoryGamePage implements OnInit {
  public positions:any=[];
  public size=2;
  choice=0;
  is_user=false;
  is_replay=false;
  is_subscription=false;
  first_choice = 0;
  second_choice = 0;
  count = 38;
  base=5;
  time=this.base;
  progress=this.base;
  interval:any;
  taille=0;
  level=1;
  user:any={};
  game:any={};

  isStarted=false;
  isConnected=true;
  showFooter=true;
  titre="";
  message="";
  showMessage=false;
  isFirstTime=true;

  pub="disabled";


  constructor(
    private navCtrl : NavController,
    private alertController : AlertController,
    private util : UtilProvider,
    private admob : AdmobProvider,
    private api : ApiProvider
  ) {
    this.initializeNetworkListener();
    this.taille=window.innerHeight
  }

  ngOnInit() {
    this.size=2;
    this.count=21;
    this.time=0;
    this.positions = this.setTiles(this.count*2)
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
        localStorage.setItem('user_ka',JSON.stringify(this.user));
      });
    } else {
      this.is_user=false;
    }
    if(localStorage.getItem('ka_settings')!='undefined'){
      let settings = JSON.parse(localStorage.getItem('ka_settings'));
      this.pub=settings.pub;
    } else {

    }

  }

  showTile(p){
    if(this.isStarted){
      if(this.time>0 && !this.is_replay){
        p.show=true;
        if(this.first_choice==0){
          this.first_choice = p.id;
        } else {
          this.second_choice = p.id;
        }

        if(this.first_choice!=0 && this.second_choice!=0){
          // les deux chois on été fait
          if(p.id%2==0){
            // verification si p et p-1 ont été cliqué
            if(this.first_choice==this.second_choice-1){
              // ok, faire disparaitre les tule et augmenter le chronos de X secondes
              this.goodChoice(this.first_choice,this.second_choice);
            } else {
              //echec
              this.badChoice(this.first_choice,this.second_choice);
            }
          } else {
            // verification si p et p-1 ont été cliqué
            if(this.second_choice==this.first_choice-1){
              // ok, faire disparaitre les tule et augmenter le chronos de X secondes
              this.goodChoice(this.first_choice,this.second_choice);
            } else {
              //echec
              this.badChoice(this.first_choice,this.second_choice);
            }
          }
          this.first_choice=0;
          this.second_choice=0;
        } else {
          // on attend le second choix
        }
      }
    } else {
      this.titre = "La partie n'a pas encore commencé";
      this.message ="Cliquer sur jouer pour commencer à jouer";
      this.showMessage=true;
    }
  }

  play_level(level){
    if(level==1){
      this.size=6;
      this.count=1;
      this.time=5;
      this.positions = this.setTiles(2)
    } else if(level==2){
      this.size=6;
      this.count=2;
      this.time=5;
      this.positions = this.setTiles(4)
    } else if(level==3){
      this.size=4;
      this.count=3;
      this.time=7;
      this.positions = this.setTiles(this.count*2)
    } else if(level==4){
      this.size=4;
      this.count=4;
      this.time=7;
      this.positions = this.setTiles(this.count*2)
    } else if(level==5){
      this.size=3;
      this.count=6;
      this.time=15;
      this.positions = this.setTiles(this.count*2)
    } else if(level==6){
      this.size=3;
      this.count=8;
      this.time=20;
      this.positions = this.setTiles(this.count*2)
    } else if(level==7){
      this.size=2;
      this.count=12;
      this.time=25;
      this.positions = this.setTiles(this.count*2)
    } else if(level==8){
      this.size=2;
      this.count=15;
      this.time=25;
      this.positions = this.setTiles(this.count*2)
    } else if(level==9){
      this.size=2;
      this.count=18;
      this.time=30;
      this.positions = this.setTiles(this.count*2)
    } else if(level==10){
      this.size=2;
      this.count=21;
      this.time=35;
      this.positions = this.setTiles(this.count*2)
    }
    this.base=this.time;
    this.progress = this.time;
    this.first_choice=0;
    this.second_choice=0;
    this.startTime();
    this.is_replay=false;
  }

  startGame(){
    if(this.isConnected){
      if(this.user.point==undefined || this.user.point<50){
        this.util.doToast('Pas assez de point pour commencer à jouer. Veuillez contacter le katika depuis votre compte',5000);
      } else {
        this.showFooter=false;
        // debit
        const opt ={
          user_id:this.user.id,
          game_id:this.game.id
        };

        this.api.post('start_game',opt).then(a=>{
          this.user.point-=50;
          this.level=1;
          this.isStarted=true;
          this.play_level(this.level);
        });
      }
    } else {
      this.showMessage=true;
      this.titre="Vous n'êtes pas connecté";
      this.message="Connectez-vous à internet pour continuer à jouer";
    }

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

  goodChoice(a,b){
    this.count-=1;
    // ok, faire disparaitre les tule et augmenter le chronos de X secondes
    setTimeout(()=>{
      _.find(this.positions,{id:a}).find=true;
      _.find(this.positions,{id:b}).find=true;
    },300)

    if(this.count==0){
      if(this.level==10){
        this.win();
      } else {
        this.win_level();
      }
    } else {
      this.time+=2;
    }
  }

  badChoice(a,b){
    setTimeout(()=>{
      _.find(this.positions,{id:a}).show=false;
      _.find(this.positions,{id:b}).show=false;
    },500)
  }

  // creation du tableau d'ojet tile
  setTiles(m){
    let t = [];
    for(let i=0; i<m;i++){
      t.push({
        id:i+1,
        show:false,
        find:false
      })
    }
    for (let i = t.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [t[i], t[j]] = [t[j], t[i]];
    }
    for (let i = t.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [t[i], t[j]] = [t[j], t[i]];
    }

    return t;
  }

  async win(){

    const opt ={
      level:this.level,
      user_id:this.user.id,
      game_id:this.game.id,
      is_winner:true
    };
    this.game.jackpot+=50;

    this.titre = "VOUS AVEZ GAGNEZ !!!";
    this.message ="Vous avez gagnez "+this.game.jackpot+" W. Vos points ont été crédités sur votre compte";
    this.showMessage=true;
    this.showFooter=true;

    this.api.post('scores',opt).then(d=>{
      this.showFooter=true;
    });

  }

  async win_level(){
    clearInterval(this.interval);
    const alert = await this.alertController.create({
      header: 'Niveau terminé',
      subHeader:"Passez au niveau suivant",
      buttons: [
        {
          text: 'Confirmer',
          role: 'confirm',
          handler: () => {
            this.level++;
            this.play_level(this.level);
          },
        }
      ],
    });

    await alert.present();
  }

  loose(){
    this.titre = "Vous avez perdu";
    this.message ="Pas de chance, peut-être une prochaine fois 😭😭😭";
    this.showMessage=true;
    this.showFooter=true;
    this.is_replay=false;
    this.isStarted=false;
    this.ionViewWillEnter();
  }

  closeMessage(event: string){
    this.showMessage=false;
  }

  startTime(){
    clearInterval(this.interval);
    this.interval = setInterval(() => {
      this.time -=1;
      this.progress=this.time/this.base;
      if (this.time == 0) {
        clearInterval(this.interval);
        if(this.count>0){
          this.loose();
        }
      }
    }, 1000);

  }

  ionViewWillLeave(){
    this.admob.showInterstitial();
    clearInterval(this.interval);
  }

  getGame(){
    const opt={
      name:'Memory'
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
