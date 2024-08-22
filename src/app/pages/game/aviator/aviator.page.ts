import { Component, OnInit } from '@angular/core';
import {AlertController, NavController} from "@ionic/angular";
import {UtilProvider} from "../../../providers/util/util";
import {ApiProvider} from "../../../providers/api/api";
import {AuthProvider} from "../../../providers/auth/auth";
import {AdmobProvider} from "../../../providers/admob/AdmobProvider";

@Component({
  selector: 'app-aviator',
  templateUrl: './aviator.page.html',
  styleUrls: ['./aviator.page.scss'],
})
export class AviatorPage implements OnInit {

  mise=0;
  timeInterval=300;
  multiplier: number = 1;
  crashTime: number = 0;
  isCrashed: boolean = false;
  successRate: number = Math.random() * 100; // Random success rate
  airplaneImage: string = 'assets/img/avatar.svg'; // Path to airplane image
  interval:any;
  is_win=false;
  isStarted=false;

  is_user=false;
  pub=false;
  user:any={};
  game:any={};

  constructor(
    public navCtrl: NavController,
    private util:UtilProvider,
    private api:ApiProvider,
    private auth:AuthProvider,
    private admob:AdmobProvider,
    private alertController:AlertController
  ) {

  }

  ngOnInit(){
    this.getGame();
  }

  ionViewWillEnter(){
    this.admob.showBanner('top',80);
    this.admob.loadInterstitial();
    if(this.api.checkUser()){
      this.is_user=true;
      this.user=JSON.parse(localStorage.getItem('user_ka'));
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

  ionViewWillLeave(){
    this.admob.removeBanner();
    clearInterval(this.interval);
  }

  startGame() {
    if(this.user.point<50){
      this.util.doToast('Pas assez de point pour commencer à jouer. Veuillez contacter le katika depuis votre compte',5000);
    } else {
      // debit
      const opt ={
        user_id:this.user.id,
        'game':'Truck Crash'
      };

      this.api.post('start_game',opt).then(a=>{
        this.user.point-=50;

      });
      this.mise=50;
      this.isStarted=true;
      this.is_win = false;
      this.isCrashed = false;
      this.multiplier = 1;
      this.crashTime = Math.floor(Math.random() * 10000) + 5000; // Crash time between 5 to 15 seconds
      //this.crashTime = Math.random() * (3 - 1);
      this.increaseMultiplier();
    }

  }

  increaseMultiplier() {
    let x = 0;
    this.interval = setInterval(() => {
      if (this.isCrashed) {
        clearInterval(this.interval);
        return;
      }
      if(x>=5000 && x<8000){
        this.multiplier+=0.01;
      } else if(x>=8000){
        this.multiplier+=0.015;
      }
      x+=this.timeInterval;

      this.multiplier += 0.01; // Increase multiplier every second
      this.successRate = Math.random() * 100; // Update success rate
      if (this.successRate < 10) {
        this.multiplier-=0.01;
        this.crash();
        clearInterval(this.interval);
      }
    }, this.timeInterval);
  }

  crash() {
    this.isCrashed = true;
    this.loose();
  }

  close(){
    this.admob.showInterstitial();
    this.navCtrl.navigateRoot('/game');
  }

  stopGame() {
    clearInterval(this.interval);
    if (!this.isCrashed) {
      //this.util.doToast('Vous avez encaissé avant le crash! Le multiplicateur était de  ' + this.multiplier.toFixed(2),5000,'medium','top');
      this.is_win=true;
      this.isStarted=false;
      // ajout des points
      this.win();
    }
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

  getGame(){
    const opt={
      name:'Truck Crash'
    };
    this.api.getList('games',opt).then((d:any)=>{
      this.game=d[0];
    })
  }


  async win(){
    this.user.point = this.user.point+this.mise*this.multiplier;
    this.game.jackpot+=50;
    const opt ={
      level:this.multiplier,
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
  async loose() {
    // enregistrement du stocke
    const opt = {
      level: 1,
      user_id: this.user.id,
      game_id: this.game.id,
      jackpot: 0,
      is_winner: false
    };
    this.game.jackpot += 50;

    this.api.post('scores', opt).then(d => {

    });
  }

  /*
  multiplier: number = 1;
  crashProbability: number = 0.05; // 5% crash rate
  isCrashed: boolean = false;
  gameInterval: any;

  constructor(private navCtrl: NavController) {}

  startGame() {
    this.isCrashed = false;
    this.multiplier = 1;
    this.gameInterval = setInterval(() => {
      this.updateMultiplier();
      this.checkCrash();
    }, 1000); // Update every second
  }

  updateMultiplier() {
    if (!this.isCrashed) {
      this.multiplier += 0.1; // Increase multiplier over time
    }
  }

  checkCrash() {
    if (Math.random() < this.crashProbability) {
      this.isCrashed = true;
      clearInterval(this.gameInterval);
      alert('Crash! Your multiplier was: ' + this.multiplier.toFixed(2));
    }
  }

  stopGame() {
    clearInterval(this.gameInterval);
    if (!this.isCrashed) {
      alert('Game stopped! Your multiplier is: ' + this.multiplier.toFixed(2));
    }
  }
   */
}
