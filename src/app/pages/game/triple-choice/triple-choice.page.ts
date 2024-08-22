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
  is_click = false;
  choice=99999;
  answer = 0;
  level=1;
  size=6;
  first_game = true;
  is_loose = false;
  is_win = false;
  is_user = false;
  is_subscription = false;
  user:any={};

  game:any={};

  constructor(
    private navCtrl:NavController,
    private alertController : AlertController,
    private util : UtilProvider,
    private admob : AdmobProvider,
    private api : ApiProvider
  ) { }

  ngOnInit() {
    this.startGame();

  }

  ionViewWillEnter(){
    this.getGame();
    this.admob.loadInterstitial();
    this.admob.showBanner('top',70);

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

  async startGame(){
    const alert = await this.alertController.create({
      header: 'Bienvenu dans "Bats à 10"',
      subHeader: 'Règles du jeu',
      message: 'A chaque niveau vous devez choisir la bonne case pour avancer. Soyez le premier à trouver les 10 bonnes cases et gagnez minimum 10 000W. Que la chance soit avec vous!',
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
            this.checkPoint(false);
          },
        }
      ],
    });

    await alert.present();
  }

  checkPoint(bool:boolean){
    if(this.user.point<50){
      this.util.doToast('Pas assez de W point pour commencer à jouer. Veuillez recharger votre compte',5000);
    } else {
      // debit
      const opt ={
        user_id:this.user.id,
        game:'Bats à 10'
      };
      this.api.post('start_game',opt).then(a=>{
        this.user.point-=50;
      });
      this.play(bool)
    }
  }

  checkChoice(t){
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
    this.is_loose = true;
    // enregistrement du stocke
    const opt ={
      level:this.level,
      user_id:this.user.id,
      game_id:this.game.id,
      jackpot:0,
      is_winner:false
    };
    this.game.jackpot+=50;

    this.api.post('scores',opt).then(d=>{

    });
    const alert = await this.alertController.create({
      header: 'Vous avez perdu',
      buttons: [
        {
          text: 'Fermer',
          role: 'cancel',
          handler: () => {
            //this.close();
            this.ionViewWillEnter();
          },
        }
      ],
    });

    await alert.present();
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


  async play(is_ads){
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
        if(is_ads){
          this.admob.showInterstitial();
          this.admob.loadInterstitial();
        }

        this.level = 1;
        this.choice=99999;
        this.setAnswer();
        this.is_loose=false;
      }*/
      if(is_ads){
        this.admob.showInterstitial();
        this.admob.loadInterstitial();
      }

      this.level = 1;
      this.choice=99999;
      this.setAnswer();
      this.is_loose=false;
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
    }
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
