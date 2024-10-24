import { Component, OnInit } from '@angular/core';
import {ApiProvider} from "../../../providers/api/api";
import {UtilProvider} from "../../../providers/util/util";
import {AlertController, NavController} from "@ionic/angular";
import {AdmobProvider} from "../../../providers/admob/AdmobProvider";

@Component({
  selector: 'app-lucky',
  templateUrl: './lucky.page.html',
  styleUrls: ['./lucky.page.scss'],
})
export class LuckyPage implements OnInit {

  dispositions = [0,1,0,0,0,0,0,0,0,0,0,0];

  user_choice=-1;
  indexDec=0;

  user:any={};
  is_user = false;
  game:any={};

  private decision=0;

  private finals=[];
  private count = 100;
  isStarted=false;

  mise = 50;

  private uscore=0;
  private percent=0;

  isConnected=true;
  showFooter=true;
  titre="";
  message="";
  showMessage=false;
  isFirstTime=true;

  USCORE=0;

  showLoading=true;

  constructor(
    private api:ApiProvider,
    private util:UtilProvider,
    public alertController:AlertController,
    public navCtrl:NavController,
    private admob:AdmobProvider
  ) {

  }

  ngOnInit() {
    this.admob.loadInterstitial();
    this.api.getSettings().then((d:any)=>{
      this.percent = d.game_settings.fortune.percent;
      //this.percent=0;
      this.finals = this.util.genererTableau(this.count,this.percent);
      this.showLoading=false;

    });
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

  ionViewWillLeave(){
    this.admob.showInterstitial();
  }

  startGame(){
    this.showMessage=false;
    this.isStarted=true;
    if(this.user.point==undefined || this.user.point<this.mise){
      this.util.doToast('Pas assez de W point pour commencer à jouer. Veuillez recharger votre compte',5000);
      this.isStarted=false;
    } else {

      if(this.isConnected){
        // debit
        const opt ={
          user_id:this.user.id,
          game_id:this.game.id
        };
        this.api.post('start_game',opt).then((a:any)=>{
          this.user.point-=this.mise;
          this.showFooter=false;
          this.uscore=a;
          this.user_choice=-1;
          this.isStarted=true;
          this.dispositions = this.util.shuffleArray(this.dispositions);
        },q=>{
          this.util.handleError(q);
        });
      } else {
        this.isStarted=false;
        this.showMessage=true;
        this.titre="Vous n'êtes pas connecté";
        this.message="Connectez-vous à internet pour continuer à jouer";
      }
    }
  }

  choice(index){
    if(this.isStarted){
      this.user_choice=index;
      this.decision=this.finals[this.indexDec];
      this.indexDec=(this.indexDec+1)%this.finals.length;
      if(this.game.is_challenge) {
        this.decision = 1
      }
      if(this.uscore>this.USCORE && !this.game.is_challenge){
        this.decision=0;
      }

      if(this.decision==0){
        while(this.dispositions[index]==1){
          this.dispositions = this.util.shuffleArray(this.dispositions);
        }
        this.loose();
      } else {
        if(this.dispositions[index]==1){
          // gagné
          this.win(this.game.jackpot);
        } else {
          // perdu
          this.loose();
        }
      }
      this.isStarted=false;
    } else {
      this.util.doToast('Cliquer sur JOUER pour commencer la partie',2000,'medium','middle')
    }
  }

  close(){
    this.navCtrl.navigateRoot('/game');
  }

  getGame(){
    const opt={
      name:'Lucky'
    };
    this.api.getList('games',opt).then((d:any)=>{
      this.game=d[0];
      this.mise = this.game.fees;
      this.USCORE = this.game.USCORE;
      if(this.isFirstTime){
        this.showRule();
        this.message = this.game.rule;
        this.isFirstTime=false;
        this.showLoading=false;
      }
    },q=>{
      this.showLoading=false;
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

  async win(jackpot){
    const opt ={
      level:10,
      user_id:this.user.id,
      game_id:this.game.id,
      jackpot,
      is_winner:true,
      //info:JSON.stringify(info)
    };
    this.titre = "VOUS AVEZ GAGNEZ !!!";
    this.message ="Vous avez gagnez "+opt.jackpot+" W. Vos points ont été crédités sur votre compte";
    this.showMessage=true;
    this.showFooter=true;
    this.api.post('scores',opt).then(d=>{
      this.ionViewWillEnter();
    },q=>{
      this.util.handleError(q);
    });
    //this.util.doToast("Felicitations, vous avez gagnez "+jackpot+" W",3000);
  }

  async loose(){
    this.isStarted=false;
    this.showFooter=true;
    this.titre = "Vous avez perdu";
    this.message ="Pas de chance, peut-être une prochaine fois 😭😭😭";
    this.showMessage=true;
    this.ionViewWillEnter();
  }



}
