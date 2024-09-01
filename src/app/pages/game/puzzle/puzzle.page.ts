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
    this.initializeNetworkListener();
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

  async startGame(){
    this.canPlay=false;
    if(this.showMessage){
      this.showMessage=false;
    }

    if(this.user.point==undefined || this.user.point<50){
      this.util.doToast('Pas assez de W point pour commencer à jouer. Veuillez recharger votre compte',5000);
    } else {
      // debit
      const opt ={
        user_id:this.user.id,
        game_id:this.game.id
      };
      this.api.post('start_game',opt).then(a=>{
        this.user.point-=50;
        this.gameOver=false;
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
    this.score = 10;
    this.totalLosses = 0;
    this.totalGains = 0;
    //this.gameOver = bool;

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
    if(this.isConnected){
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
              this.isStarted=false;
              this.isCrashed=true;
              this.canPlay = false;
              this.gameOver = true;
              this.loose();
            } else {
              this.util.doToast('Il vous reste une vie',1000,'light');
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
      this.titre="Vous n'êtes pas connecté";
      this.message="Connectez-vous à internet pour continuer à jouer"
    }

  }

  win(){
    this.canPlay=false;
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
  }

  closeMessage(event: string){
    this.showMessage=false;
    if(this.gameOver||this.isCrashed){
      this.ionViewWillEnter();
    }
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
        console.log('Connexion Internet restaurée.');
        // Ajoute une notification pour l'utilisateur ici si nécessaire
      }
    });
  }


}
