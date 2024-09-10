import { Component, OnInit } from '@angular/core';
import {AlertController, NavController} from "@ionic/angular";
import {ApiProvider} from "../../../providers/api/api";
import {UtilProvider} from "../../../providers/util/util";
import {AdmobProvider} from "../../../providers/admob/AdmobProvider";
import { Network, NetworkStatus } from '@capacitor/network';

@Component({
  selector: 'app-puzzle',
  templateUrl: './puzzle.page.html',
  styleUrls: ['./puzzle.page.scss'],
})
export class PuzzlePage implements OnInit {
  private screenWidth: number = window.innerWidth;

  gridSize: number = 5;
  crystals: any[] = [];
  score: number = 0;
  gameOver: boolean = false;
  totalGains: number = 0;
  totalLosses: number = 0;

  gridGap="";
  titre="";
  message="";
  showMessage=false;
  isFirstTime=true;
  showFooter=true;

  private indexLife=0;
  private price_life = [0.5,1,1.5,2,3,4,5];

  mise=0;

  isStarted=false;
  isConnected=true;
  isCrashed=false;
  canPlay=false;

  user:any={};
  is_user = false;
  game:any={};

  constructor(
    private api:ApiProvider,
    private util:UtilProvider,
    public alertController:AlertController,
    public navCtrl:NavController,
    private admob:AdmobProvider
  ) {
    this.util.initializeNetworkListener();
    if(this.screenWidth<310){
      this.gridGap="1px"
    } else {
      this.gridGap="10px"
    }
  }

  ngOnInit() {
    this.initializeGame(true);
    this.admob.loadInterstitial();
  }

  ionViewWillEnter(){
    this.api.getSettings().then((d:any)=>{
      this.price_life = d.game_settings.crystal.price_life
    });

    this.getGame();

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

  ionViewWillLeave(){
    this.admob.showInterstitial();
  }

  async startGame(){
    this.canPlay=false;
    if(this.showMessage){
      this.showMessage=false;
    }

    if(this.user.point==undefined || this.user.point<this.mise){
      this.util.doToast('Pas assez de W point pour commencer à jouer. Veuillez recharger votre compte',5000);
    } else {
      // debit
      const opt ={
        user_id:this.user.id,
        game_id:this.game.id
      };
      this.api.post('start_game',opt).then(a=>{
        this.user.point-=this.mise;
        this.gameOver=false;
        this.showFooter=false;
        this.isStarted=true;
        this.canPlay=true;
        this.initializeGame(false);
      },q=>{
        this.util.handleError(q);
      });

    }

  }

  close(){
    if(this.isStarted){
      //
    }
    this.admob.showInterstitial();
    this.navCtrl.navigateRoot('/game');
  }

  getGame(){
    const opt={
      name:'Crystal'
    };
    this.api.getList('games',opt).then((d:any)=>{
      this.game=d[0];
      this.mise = this.game.fees;
      if(this.isFirstTime){
        this.showRule();
        this.message = this.game.rule;
        this.isFirstTime=false;
      }
    },q=>{
      this.util.handleError(q);
    })
  }

  async showRule(){
    this.titre=this.game.name;
    this.message=this.game.rule;
    this.showMessage=true;
  }

  initializeGame(bool) {
    this.crystals = [];
    this.score = 0;
    this.totalLosses = 0;
    this.totalGains = 0;
    //this.gameOver = bool;

    let countGain=0;
    let countNeutral=0;

    for (let i = 0; i < this.gridSize * this.gridSize; i++) {
      const type = this.getRandomOutcome();
      if(type=='gain'){
        if(countGain>4){
          this.crystals.push({
            revealed: false,
            type:'loss',
          });
        } else {
          this.crystals.push({
            revealed: false,
            type,
          });
        }
        countGain++;
      } else if(type=='neutral'){
        if(countNeutral>8){
          this.crystals.push({
            revealed: false,
            type:'loss',
          });
        } else {
          this.crystals.push({
            revealed: false,
            type,
          });
        }
        countNeutral++;
      } else {
        this.crystals.push({
          revealed: false,
          type
        });
      }
    }
  }

  getRandomOutcome() {
    const outcomes = ['gain', 'loss', 'neutral']; // Exemples de types de cristaux
    console.log(outcomes[Math.floor(Math.random() * outcomes.length)]);
    return outcomes[Math.floor(Math.random() * outcomes.length)];
  }

  revealCrystal(index: number) {
    if(this.isConnected){
      if(this.isStarted){
        this.showMessage=false;
        if (!this.crystals[index].revealed && this.canPlay) {
          this.crystals[index].revealed = true;

          switch (this.crystals[index].type) {
            case 'gain':
              this.score += 10;
              this.totalGains++;
              break;
            case 'loss':
              //this.score -= 5;
              this.totalLosses++;
              if (this.totalLosses >= 2) {
                if(this.user.point>this.price_life[this.indexLife]){
                  this.buyLive();
                } else {
                  this.showFooter=true;
                  this.isStarted=false;
                  this.isCrashed=true;
                  this.canPlay = false;
                  this.gameOver = true;
                  this.loose();
                }
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
      } else {
        this.showMessage=true;
        this.titre="Aucune partie";
        this.message="Cliquez sur JOUER pour commencer la partie"
      }

    } else {
      this.showMessage=true;
      this.titre="Vous n'êtes pas connecté";
      this.message="Connectez-vous à internet pour continuer à jouer"
    }

  }

  win(){
    this.canPlay=false;
    this.showFooter=true;
    this.game.jackpot+=50;

    const opt ={
      level:10,
      user_id:this.user.id,
      game_id:this.game.id,
      jackpot:this.game.jackpot,
      is_winner:true
    };

    this.api.post('scores',opt).then(d=>{
      this.titre = "Vous avez gagnez";
      this.message ="Toutes nos félicitations 🥳🥳🥳🥳, la cagnotte a été créditée sur votre compte";
      this.showMessage=true;
    },q=>{
      this.util.handleError(q);
    });
  }

  loose(){
    this.titre = "Vous avez perdu";
    this.message ="Vous n'avez pas reussi à trouver les 5 cristaux 😭😭😭";
    this.showMessage=true;
    this.gameOver=true;
    this.showFooter=true;
    this.isStarted=false;
    this.canPlay=false;
    this.indexLife=0;
  }

  closeMessage(event: string){
    this.showMessage=false;
    if(this.gameOver||this.isCrashed){
      this.ionViewWillEnter();
    }
  }

  async buyLive(){
    if(this.score==30){
      this.indexLife=4;
    } else if(this.score==40){
      this.indexLife=8;
    }
    const alert = await this.alertController.create({
      //cssClass: 'my-custom-class',
      header: 'Acheter une vie?',
      message:"Continuer à jouer pour "+(this.price_life[this.indexLife])+" W",
      buttons: [
        {
          text: 'Non',
          role: 'cancel',
          //cssClass: 'secondary',
          handler: () => {
            this.loose();
          }
        }, {
          text: 'Oui',
          handler: (data:any) => {
            // reduction
            const opt ={
              multiplier:this.price_life[this.indexLife]
            };

            this.api.post('get_life',opt).then(d=>{
              this.showFooter=false;
              this.isStarted=true;
              this.isCrashed=false;
              this.canPlay = true;
              this.gameOver = false;
              this.user.point-=this.price_life[this.indexLife];
              this.totalLosses=1;
              this.indexLife++;
            })
          }
        }
      ]
    });

    await alert.present();
  }

}
