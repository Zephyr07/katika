import { Component, OnInit } from '@angular/core';
import { NavController} from "@ionic/angular";
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

  prelevement = 0;
  gain = 0;
  user_point = 0;
  user_name ="";

  countdownInterval:any;
  user_multiplier:number;
  mise=50;

  current_gain=0;
  history="";

  total_partie=0;
  private timeInterval=15;
  multiplier: number = 1;
  private private_multiplier: number = 1;
  private crashTime: number = 0;
  isCrashed: boolean = false;

  airplaneImage: string = 'assets/img/avatar.svg'; // Path to airplane image
  interval:any;
  is_win=false;
  isStarted=false;
  showLoading=true;
  private finals=[];
  private series=[];
  private index=0;
  private decision=0;

  percent=0;
  lessThan10=0;
  lessThan1=0;
  lessThan2=0;
  lessThan5=0;
  greaterThan10=0;


  can_play=true;

  isConnected = true;
  showFooter=true;
  titre="";
  message="";
  showMessage=false;
  isFirstTime=true;

  party=0;

  is_user=false;
  pub=false;
  private user:any={};
  game:any={};
  private target =0;
  private count = 50;
  private dif = 0;
  isWin=false;
  auto=false;
  chiffre=3; // valeur du countdown
  isCountdown=false;

  constructor(
    public navCtrl: NavController,
    private util:UtilProvider,
    private api:ApiProvider,
    private auth:AuthProvider,
    private admob:AdmobProvider
  ) {
    this.util.initializeNetworkListener();

    //console.log(this.series);
    //console.log(this.finals);
  }

  ngOnInit(){
    this.getGame();
    this.admob.loadInterstitial();
    this.api.getSettings().then((d:any)=>{
      this.percent=d.game_settings.truck.percent;
      //this.percent=0;
      this.lessThan10=d.game_settings.truck.lessThan10;
      this.lessThan1=d.game_settings.truck.lessThan1;
      this.lessThan2=d.game_settings.truck.lessThan2;
      this.lessThan5=d.game_settings.truck.lessThan5;
      this.greaterThan10=d.game_settings.truck.greaterThan10;

      this.series = this.getSeries(this.count);
      this.finals= this.genererTableau(this.count);

      //console.log(this.finals);
      //console.log(this.series);
    })
  }

  ionViewWillEnter(){

    if(this.api.checkUser()){
      this.is_user=true;
      this.api.getList('auth/me',{id:this.user.id}).then((a:any)=>{
        this.user = a.data.user;
        this.user_point = this.user.point;
        this.user_name = this.user.user_name;
        localStorage.setItem('user_ka',JSON.stringify(this.user));
      },q=>{
        this.util.handleError(q);
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
    this.admob.showInterstitial();
    clearInterval(this.interval);
  }

  startGame() {
    this.showMessage=false;
    if(this.mise>=this.game.fees){

      if(this.user_multiplier!=undefined && this.user_multiplier>1){
        this.api.getList('auth/me',{id:this.user.id}).then((a:any)=>{
          this.user = a.data.user;
          localStorage.setItem('user_ka',JSON.stringify(this.user));
        });

        if(this.user.point==undefined || this.user.point<this.mise){
          this.util.doToast('Pas assez de point pour commencer à jouer. Veuillez contacter le katika depuis votre compte',5000);
          this.isCountdown=false;
          clearInterval(this.countdownInterval);
          clearInterval(this.interval);
          this.chiffre=5;
          this.isStarted=false;
          this.isCrashed=false;
          this.is_win=false;
          this.auto=false;
          this.can_play=true;
          this.showFooter=true;
        } else {
          this.lanceur();
        }

      } else {
        this.util.doToast('Vous n\'avez pas renseinger de multiplicateur',3000,'tertiary');
      }
    } else {
      this.showMessage=true;
      this.titre="Mise insuffisante";
      this.message="La mise doit être comprise entre 50 et 10 000W";
    }


  }

  lanceur(){
    if(this.isConnected){
      this.showFooter=false;
      this.isCountdown=true;
      this.chiffre=3;
      this.countdownInterval = setInterval(()=>{
        this.chiffre--;
        if(this.chiffre==0){
          this.isCountdown=false;
          clearInterval(this.countdownInterval);

          // debit
          const opt ={
            user_id:this.user.id,
            game_id:this.game.id,
            mise:this.mise
          };

          this.api.post('start_game',opt).then(a=>{
            this.user_point-=this.mise;
            this.prelevement+=this.mise;
            this.settings();
          },q=>{
            this.util.handleError(q);
          });



        }
      },1000);
    } else {
      this.showMessage=true;
      this.titre="Vous n'êtes pas connecté";
      this.message="Connectez-vous à internet pour continuer à jouer";
    }
  }

  settings(){
    this.total_partie++;
    this.isCrashed=false;
    this.isWin=false;
    this.isStarted=false;

    //const index = Math.floor(Math.random() * this.series.length);
    this.target = this.series[this.index];
    this.decision = this.finals[this.index];
    if(this.index==this.series.length-1){
      this.series = this.getSeries(this.count);
      this.finals= this.genererTableau(this.count);
      this.index=0;
    }
    if(this.mise>1000){
      this.finals=this.genererTableau(10,this.mise);
      //console.log(this.finals);
    }

    if(this.finals[this.index]==0 && this.target>this.user_multiplier){
      if(this.user_multiplier>this.target){
        this.dif = this.randomInRange(1,this.target-0.01);
        this.target = this.dif;
      } else {
        this.dif = this.randomInRange(1,this.user_multiplier-0.01);
        this.target = this.dif;
      }
    }
    if(this.target>7){
      this.timeInterval=5;
    }

    this.index++;
    this.isStarted=true;
    this.is_win = false;
    this.isCrashed = false;
    this.multiplier = 1;
    this.private_multiplier = 1;
    this.crashTime = Math.floor(Math.random() * 10000) + 5000; // Crash time between 5 to 15 seconds
    this.increaseMultiplier();
  }

  x=0;

  increaseMultiplier() {
    this.interval = setInterval(() => {

      if (this.isCrashed) {
        clearInterval(this.interval);
        return;
      }

      if(this.decision==1){
        if(this.is_win && this.multiplier==this.target){
          this.history+="M:"+this.mise+"|U:"+this.user_multiplier+"|T:"+this.target+"|G:"+this.mise*this.user_multiplier+"\n";
          this.stopGame();
          return;
        }
        if(!this.is_win && this.private_multiplier==this.target){
          this.history+="M:"+this.mise+"|U:"+this.user_multiplier+"|T:"+this.target+"|G:0\n";
          // crash
          this.crash();
          clearInterval(this.interval);
          return;
        }
        if(this.private_multiplier == this.target && this.private_multiplier<this.user_multiplier) {
          this.history+="M:"+this.mise+"|U:"+this.user_multiplier+"|T:"+this.target+"|G:0\n";
          this.crash();
          clearInterval(this.interval);
          return;
        }
        if(this.private_multiplier==this.user_multiplier){
          this.is_win=true;
        }
      } else {
        // decision 0
        if(this.user_multiplier==1.01 || this.user_multiplier-1.01<0.1){
          this.history+="M:"+this.mise+"|U:"+this.user_multiplier+"|T:"+this.target+"|G:0\n";
          this.crash();
          clearInterval(this.interval);
          return;
        } else {
          // un nombre entre 1.00 et user_multiplier
          if(this.user_multiplier>this.target){
            if(this.target==this.private_multiplier){
              this.history+="M:"+this.mise+"|U:"+this.user_multiplier+"|T:"+this.target+"|G:0\n";
              // crash
              this.crash();
              clearInterval(this.interval);
              return;
            }
          } else if(this.target==this.private_multiplier){
            this.history+="M:"+this.mise+"|U:"+this.user_multiplier+"|T:"+this.target+"|G:0\n";
            this.crash();
            clearInterval(this.interval);
            return;
          } else {
            // on attends
          }
        }

      }
      this.private_multiplier = parseFloat(this.private_multiplier.toFixed(2));
      this.private_multiplier +=0.01;
      this.private_multiplier = parseFloat(this.private_multiplier.toFixed(2));
      this.multiplier=this.private_multiplier;

      this.x+=this.timeInterval;

    }, this.timeInterval);
  }

  crash() {
    this.isCrashed = true;
    this.can_play = !this.auto;
    //this.loose();
    setTimeout(()=>{
      if(this.auto){
        this.startGame();
      } else {
        this.history="";
        this.isStarted=false;
        this.showFooter=true;
        this.can_play=true;
        this.total_partie=0;
        this.gain=0;
        this.prelevement=0;
      }
    },2000)
  }

  cancel(){
    clearInterval(this.countdownInterval);
    clearInterval(this.interval);
    this.chiffre=3;
    if(this.total_partie>1 && this.gain - this.prelevement>0){
      const info = {
        mise:this.mise,
        user_multiplier:this.user_multiplier,
        target:this.target,
        gain:this.gain-this.prelevement,
        auto:true,
        history:this.history
      };
      const opt ={
        level:this.user_multiplier,
        user_id:this.user.id,
        game_id:this.game.id,
        jackpot:this.gain-this.prelevement,
        is_winner:true,
        info:JSON.stringify(info)
      };

      this.api.post('scores',opt).then(d=>{
        this.titre = "VOUS AVEZ GAGNEZ !!!";
        this.message ="Vous avez gagnez "+(this.gain-this.prelevement)+" W. Vos points ont été crédités sur votre compte";
        this.showMessage=true;
        this.total_partie=0;
        this.isCountdown=false;
        this.chiffre=3;
        this.prelevement=0;
        this.gain=0;
        this.isStarted=false;
        this.isCrashed=false;
        this.auto=false;
        this.can_play=true;
        this.showFooter=true;
        this.ionViewWillEnter();
      },q=>{
        this.util.handleError(q);
      });
    } else {
      this.total_partie=0;
      this.prelevement=0;
      this.gain=0;
      this.isCountdown=false;
      this.chiffre=3;
      this.isStarted=false;
      this.isCrashed=false;
      this.auto=false;
      this.can_play=true;
      this.showFooter=true;
    }
  }

  close(){
    this.navCtrl.navigateRoot('/game');
  }

  stopGame() {
    clearInterval(this.interval);
    if (!this.isCrashed) {
      // ajout des points
      this.isCrashed=true;
      this.win();
    } else {
      this.showFooter=true;
    }
  }

  closeMessage(event: string){
    this.showMessage=false;
  }

  showRule(){
    this.titre=this.game.name;
    this.message=this.game.rule;
    this.showMessage=true;
  }

  getGame(){
    const opt={
      name:'Truck Crash'
    };
    this.api.getList('games',opt).then((d:any)=>{
      this.game=d[0];
      if(this.isFirstTime){
        this.showRule();
        this.message = this.game.rule;
        this.isFirstTime=false;

      }
      this.showLoading=false;
    },q=>{
      this.util.handleError(q);
      this.showLoading=false;
    })
  }


  async win(){
    if(this.auto){
      this.titre = "VOUS AVEZ GAGNEZ !!!";
      this.message ="Vous avez gagnez "+this.mise*this.user_multiplier+" W";
      this.showMessage=true;

      this.gain+=this.mise*this.user_multiplier;

      setTimeout(()=>{
        this.startGame();
      },2000);
    } else {
      const info = {
        mise:this.mise,
        user_multiplier:this.user_multiplier,
        target:this.target,
        gain:this.mise*this.user_multiplier,
        history:this.history
      };
      const opt ={
        level:this.user_multiplier,
        user_id:this.user.id,
        game_id:this.game.id,
        jackpot:this.mise*this.user_multiplier,
        is_winner:true,
        info:JSON.stringify(info)
      };

      this.api.post('scores',opt).then(d=>{
        this.titre = "VOUS AVEZ GAGNEZ !!!";
        this.message ="Vous avez gagnez "+opt.jackpot+" W. Vos points ont été crédités sur votre compte";
        this.showMessage=true;
        this.total_partie=0;
        this.isStarted=false;
        this.showFooter=true;
        this.ionViewWillEnter();
      },q=>{
        this.util.handleError(q);
      });
    }


  }


  getSeries(count){
    let numbers = [];

    // Define the percentage distributions
    let percentages = {
      "lessThan1": this.lessThan1,  // 60% < 1
      "lessThan2": this.lessThan2,  // 24% < 2
      "lessThan5": this.lessThan5,  // 10% < 5
      "lessThan10": this.lessThan10, // 5% < 10
      "greaterThan10": this.greaterThan10 // 1% > 10
    };

    // Calculate how many numbers we need for each range
    let limits = {
      "lessThan1": Math.floor(count * percentages.lessThan1),
      "lessThan2": Math.floor(count * percentages.lessThan2),
      "lessThan5": Math.floor(count * percentages.lessThan5),
      "lessThan10": Math.floor(count * percentages.lessThan10),
      "greaterThan10": Math.floor(count * percentages.greaterThan10)
    };


    // Generate numbers based on the ranges

    for (let i = 0; i < limits.lessThan2; i++) {
      numbers.push(this.randomInRange(2, 2.99));
    }

    for (let i = 0; i < limits.lessThan5; i++) {
      numbers.push(this.randomInRange(3, 5));
    }

    for (let i = 0; i < limits.lessThan1; i++) {
      numbers.push(this.randomInRange(1, 1.99));
    }

    for (let i = 0; i < limits.lessThan10; i++) {
      numbers.push(this.randomInRange(6, 10));
    }

    for (let i = 0; i < limits.greaterThan10; i++) {
      numbers.push(this.randomInRange(10, 20));
    }

    // If the total number of numbers is less than count due to rounding, fill up the remainder with random <1 numbers
    /*while (numbers.length < count) {
      numbers.push(this.randomInRange(0, 1));
    }*/

    // Mélange de la série pour répartir aléatoirement les nombres
    numbers = this.shuffleArray(numbers);
    return numbers;
  }

  // Helper function to generate random numbers within a range with 2 decimals
  randomInRange(min, max) {
    return parseFloat((Math.random() * (max - min) + min).toFixed(2));
  }

  shuffleArray<T>(array: T[]): T[] {
    let currentIndex = array.length, randomIndex;

    // Tant qu'il reste des éléments à mélanger...
    while (currentIndex !== 0) {
      // Choisir un élément restant...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // Et échanger l'élément actuel avec celui aléatoire
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;
  }

  genererTableau(X: number,mise?:number): number[] {
    const tableau: number[] = [];

    let nbZeros = Math.floor(X * this.percent); // Calcul du nombre de 0 (70%)
  //let nbZeros = Math.floor(X * 1); // Calcul du nombre de 0 (70%)
    if(this.mise>1000 && this.mise<4999 && this.user_multiplier>4){
      nbZeros = Math.floor(X * 0.9)
    } else if(this.mise>5000){
      nbZeros = Math.floor(X * 0)
    }

    const nbUn = X - nbZeros; // Le reste sera des 1

    // Ajouter 0 au tableau
    for (let i = 0; i < nbZeros; i++) {
      tableau.push(0);
    }

    // Ajouter 1 au tableau
    for (let i = 0; i < nbUn; i++) {
      tableau.push(1);
    }

    // Mélanger le tableau de manière aléatoire pour répartir les 0 et 1
    for (let i = tableau.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tableau[i], tableau[j]] = [tableau[j], tableau[i]]; // Échange des éléments
    }

    return tableau;
  }
}
