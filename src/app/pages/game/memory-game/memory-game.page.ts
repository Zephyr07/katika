import { Component, OnInit } from '@angular/core';
import {AlertController, NavController} from "@ionic/angular";
import {ApiProvider} from "../../../providers/api/api";
import * as _ from "lodash";
import {UtilProvider} from "../../../providers/util/util";
import {AdmobProvider} from "../../../providers/admob/AdmobProvider";

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

  pub="disabled";


  constructor(
    private navCtrl : NavController,
    private alertController : AlertController,
    private util : UtilProvider,
    private admob : AdmobProvider,
    private api : ApiProvider
  ) {
    this.taille=window.innerHeight
  }

  ngOnInit() {
    this.startGame();
  }

  ionViewWillEnter(){
    this.admob.showInterstitial();
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
    if(localStorage.getItem('ka_settings')!='undefined'){
      let settings = JSON.parse(localStorage.getItem('ka_settings'));
      this.pub=settings.pub;
    } else {

    }
    this.admob.loadInterstitial();
  }

  showTile(p){
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
  }

  async replay(){
    clearInterval(this.interval);
    if(this.pub=='enable'){
      await this.admob.showInterstitial();
      await this.admob.loadInterstitial();
    }
    /*this.time=this.base;
    this.progress = this.base;
    this.is_replay=true;

    clearInterval(this.interval);*/
    this.level=1;
    this.startGame()
  }

  async play(){
    if(this.is_user){
      /*if(!this.is_subscription){
        const alert = await this.alertController.create({
          header: 'Vous n\'êtes pas membre de la salle',
          message: 'Devenez membre pour pouvoir jouer à ce jeu',
          buttons: [
            {
              text: 'Fermer',
              role: 'cancel',
              handler: () => {
                this.close();
              },
            },
            {
              text: 'Devenir membre',
              role: 'confirm',
              handler: () => {
                console.log('Alert canceled');
                this.becomeMember();
              },
            }
          ],
        });

        await alert.present();
      } else {
        this.first_choice=0;
        this.second_choice=0;
        this.time=this.base;
        this.progress = this.time;
        this.count=18;
        this.positions = this.setTiles(36);
        this.startTime();
        this.is_replay=false;
      }*/
      this.first_choice=0;
      this.second_choice=0;
      this.time=this.base;
      this.progress = this.time;
      this.count=18;
      this.positions = this.setTiles(36);
      this.startTime();
      this.is_replay=false;
    } else {
      const alert = await this.alertController.create({
        header: 'Vous n\'êtes pas connecté',
        message: 'Connectez-vous pour pouvoir jouer à ce jeu',
        buttons: [
          {
            text: 'Fermer',
            role: 'cancel',
            handler: () => {
              this.close();
            },
          },
          {
            text: 'Se connecter',
            role: 'confirm',
            handler: () => {
              console.log('Alert canceled');
              this.login();
            },
          }
        ],
      });

      await alert.present();
    }
  }

  async play_level(level){
    if(this.is_user){
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
    } else {
      const alert = await this.alertController.create({
        header: 'Vous n\'êtes pas connecté',
        message: 'Connectez-vous pour pouvoir jouer à ce jeu',
        buttons: [
          {
            text: 'Fermer',
            role: 'cancel',
            handler: () => {
              this.close();
            },
          },
          {
            text: 'Se connecter',
            role: 'confirm',
            handler: () => {
              console.log('Alert canceled');
              this.login();
            },
          }
        ],
      });

      await alert.present();
    }
  }

  async startGame(){
    const alert = await this.alertController.create({
      header: 'Bienvenu dans "Memory"',
      subHeader: 'Règles du jeu',
      message: 'Vous devez trouvez les 16 paires avant le temps imparti pour gagner. Vous gagnez 2s lorsque vous trouvez une paire correct. Trouvez toutes les paires et gagnez 1 heure de jeu gratuit à la salle. Que la chance soit avec vous!',
      buttons: [
        {
          text: 'Fermer',
          role: 'cancel',
          handler: () => {
            this.close();
          },
        },
        {
          text: 'Jouer',
          role: 'confirm',
          handler: () => {
            console.log('Alert canceled');
            this.checkPoint();
          },
        }
      ],
    });

    await alert.present();
  }

  checkPoint(){
    if(this.user.point<50){
      this.util.doToast('Pas assez de point pour commencer à jouer. Veuillez contacter le katika depuis votre compte',5000);
    } else {
      // debit
      const opt ={
        user_id:this.user.id,
        game_id:this.game.id
      };

      this.api.post('start_game',opt).then(a=>{
        this.user.point-=50;

      });
      this.play_level(this.level);
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
    this.time+=2;
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

    this.api.post('scores',opt).then(d=>{

    });
    const alert = await this.alertController.create({
      header: 'VOUS AVEZ GAGNEZ',
      subHeader:"Toutes nos félicitations",
      message: 'Vos points ont été crédités sur votre compte',
      buttons: [
        {
          text: 'Fermer',
          role: 'confirm',
          handler: () => {
            this.ionViewWillEnter();
          },
        }
      ],
    });

    await alert.present();
  }

  async win_level(){
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

  async loose(){
    // enregistrement du stocke
    const opt ={
      level:this.level,
      user_id:this.user.id,
      game_id:this.game.id,
      is_winner:false
    };
    this.game.jackpot+=50;

    this.api.post('scores',opt).then(d=>{
      //console.log(d)
    });
    const alert = await this.alertController.create({
      header: 'Vous avez perdu',
      buttons: [
        {
          text: 'Fermer',
          role: 'cancel',
          handler: () => {
            //this.close();
            //clearInterval(this.interval);
            this.is_replay=false;
            this.ionViewWillEnter();
          },
        }
      ],
    });

    await alert.present();
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
    clearInterval(this.interval);
  }

  getGame(){
    const opt={
      name:'Memory'
    };
    this.api.getList('games',opt).then((d:any)=>{
      this.game=d[0];
    })
  }

  async showRule(){
    const alert = await this.alertController.create({
      header: 'Bienvenu dans "'+this.game.name+'"',
      subHeader: 'Règles du jeu',
      message: this.game.rule,
      buttons: [
        {
          text: 'Fermer',
          role: 'cancel',
          handler: () => {

          },
        }
      ],
    });

    await alert.present();
  }
}
