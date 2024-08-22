import { Component, OnInit } from '@angular/core';
import {AlertController, NavController} from "@ionic/angular";
import {ApiProvider} from "../../../providers/api/api";
import {UtilProvider} from "../../../providers/util/util";
import {AdmobProvider} from "../../../providers/admob/AdmobProvider";

@Component({
  selector: 'app-puzzle',
  templateUrl: './puzzle.page.html',
  styleUrls: ['./puzzle.page.scss'],
})
export class PuzzlePage implements OnInit {
  gridSize: number = 5;
  crystals: any[] = [];
  score: number = 0;
  gameOver: boolean = false;
  totalGains: number = 0;
  totalLosses: number = 0;

  isStarted=false;
  isCrashed=false;

  user:any={};
  is_user = false;
  game:any={};
  constructor(
    private api:ApiProvider,
    private util:UtilProvider,
    public alertController:AlertController,
    public navCtrl:NavController,
    private admob:AdmobProvider
  ) { }

  ngOnInit() {
    this.initializeGame(true);
    this.admob.loadInterstitial();
  }

  ionViewWillEnter(){
    this.getGame();

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
  }

  startGame(){
    this.isStarted=true;
    if(this.user.point<50){
      this.util.doToast('Pas assez de W point pour commencer à jouer. Veuillez recharger votre compte',5000);
    } else {
      // debit
      const opt ={
        user_id:this.user.id,
        game:'Crystal'
      };
      this.api.post('start_game',opt).then(a=>{
        this.user.point-=50;
      });
      this.initializeGame(false);
    }
  }

  close(){
    this.admob.showInterstitial();
    this.navCtrl.navigateRoot('/game');
  }

  getGame(){
    const opt={
      name:'Crystal'
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

  initializeGame(bool) {
    this.crystals = [];
    this.score = 0;
    this.gameOver = bool;

    for (let i = 0; i < this.gridSize * this.gridSize; i++) {
      this.crystals.push({
        revealed: false,
        type: this.getRandomOutcome(),
      });
    }
  }

  getRandomOutcome() {
    const outcomes = ['gain', 'loss', 'neutral']; // Exemples de types de cristaux
    return outcomes[Math.floor(Math.random() * outcomes.length)];
  }

  revealCrystal(index: number) {
    if (!this.crystals[index].revealed && !this.gameOver) {
      this.crystals[index].revealed = true;

      switch (this.crystals[index].type) {
        case 'gain':
          this.score += 10;
          this.totalGains++;
          break;
        case 'loss':
          this.score -= 5;
          this.totalLosses++;
          if (this.totalLosses >= 1) {
            this.isStarted=false;
            this.isCrashed=true;
            this.gameOver = true;
            this.loose();
          }
          break;
        case 'neutral':
        default:
          // Rien ne se passe pour une case neutre
          break;
      }

      if (this.score >= 50) {
        this.gameOver = true;
        this.win();
      }
    }
  }

  async win(){
    this.game.jackpot+=50;
    const opt ={
      level:10,
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

  async loose(){
    // enregistrement du stocke
    const opt ={
      level:this.score/10,
      user_id:this.user.id,
      game_id:this.game.id,
      jackpot:0,
      is_winner:false
    };
    this.game.jackpot+=50;

    this.api.post('scores',opt).then(d=>{

    });
    const alert = await this.alertController.create({
      header: 'VOUS AVEZ PERDU',
      message: 'Vous n\'avez pas reussi à trouver les 5 crystaux',
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



}
