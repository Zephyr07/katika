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

  countdownInterval:any;
  user_multiplier:number;
  mise=50;
  total_gain=0;
  total_partie=0;
  private timeInterval=50;
  multiplier: number = 1;
  private private_multiplier: number = 1;
  private crashTime: number = 0;
  isCrashed: boolean = false;
  //private successRate: number = Math.random() * 100; // Random success rate
  airplaneImage: string = 'assets/img/avatar.svg'; // Path to airplane image
  interval:any;
  is_win=false;
  isStarted=false;
  private finals=[];
  private series=[];
  private index=0;
  private decision=0;

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
  user:any={};
  game:any={};
  private target =0;
  private count = 100;
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
    this.series = this.getSeries(this.count);
    this.finals= this.genererTableau(this.count);
    this.dif = this.randomInRange(0,0.1);
    //console.log(this.series);
    //console.log(this.finals);
  }

  ngOnInit(){
    this.getGame();
  }

  ionViewWillEnter(){
    this.admob.loadInterstitial();
    if(this.api.checkUser()){
      this.is_user=true;
      this.api.getList('auth/me',{id:this.user.id}).then((a:any)=>{
        this.user = a.data.user;
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
    if(this.mise>=50){
      this.dif = this.randomInRange(0,0.1);
      this.api.getList('auth/me',{id:this.user.id}).then((a:any)=>{
        this.user = a.data.user;
        localStorage.setItem('user_ka',JSON.stringify(this.user));
      });
      this.party++;

      if(this.user_multiplier!=undefined && this.user_multiplier>1){
        if(this.user.point==undefined || this.user.point<this.mise){
          this.util.doToast('Pas assez de point pour commencer à jouer. Veuillez contacter le katika depuis votre compte',5000);
          this.isCountdown=false;
          clearInterval(this.countdownInterval);
          clearInterval(this.interval);
          this.chiffre=5;
          this.isStarted=false;
          this.isCrashed=false;
          this.auto=false;
          this.can_play=true;
          this.showFooter=true;
        } else {
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
                  this.user.point-=this.mise;
                  // gestion du countdown
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
                    this.finals=this.genererTableau(this.count,this.mise);
                  }
                  this.index++;
                  this.isStarted=true;
                  this.is_win = false;
                  this.isCrashed = false;
                  this.multiplier = 1;
                  this.private_multiplier = 1;
                  this.crashTime = Math.floor(Math.random() * 10000) + 5000; // Crash time between 5 to 15 seconds
                  this.increaseMultiplier();
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
      } else {
        this.util.doToast('Vous n\'avez pas renseinger de multiplicateur',3000,'tertiary');
      }
    } else {
      this.showMessage=true;
      this.titre="Mise insuffisante";
      this.message="La mise doit être comprise entre 50 et 10 000W";
    }


  }

  x=0;

  increaseMultiplier() {
    this.interval = setInterval(() => {

      if (this.isCrashed) {
        clearInterval(this.interval);
        return;
      }

      let minus = 0;
      if(this.user_multiplier>=1 && this.user_multiplier<2){
        this.private_multiplier += 0.01;
        minus=0.01;
      } else if(this.user_multiplier>=2 && this.user_multiplier<4){
        this.private_multiplier += 0.02;
        minus=0.05;
      } else if(this.user_multiplier>=3 && this.user_multiplier<5){
        this.private_multiplier += 0.05;
        minus=0.1;
      } else if(this.user_multiplier>=5 && this.user_multiplier<10){
        this.private_multiplier += 0.08;
        minus=0.3;
      } else if(this.user_multiplier>=10 && this.user_multiplier<15){
        this.private_multiplier += 0.1;
        minus=0.5;
      } else if(this.user_multiplier>=15){
        this.private_multiplier += 0.2;
        minus=0.5;
      }

      if(this.private_multiplier>=this.user_multiplier-minus){
        if(this.decision==0){
          this.crash();
          clearInterval(this.interval);
          //console.log('c');
          return;
        } else {
          this.multiplier=this.user_multiplier;
          // victoire
          this.stopGame();
          //console.log("F");
          return;
        }
      }

      if(this.private_multiplier>this.target){
        this.multiplier+=0.01;
        //console.log("a",this.private_multiplier,this.multiplier);
        this.crash();
        clearInterval(this.interval);
        return;
      }

      if(this.decision==0 && this.user_multiplier==1.01){
        this.crash();
        clearInterval(this.interval);
        //console.log('b');
        return;

      }
      if(this.decision==0 && this.user_multiplier-1.01>0.1){
        if(this.private_multiplier==this.user_multiplier-this.dif){
          this.crash();
          clearInterval(this.interval);
          //console.log('d');
          return;
        }

      }

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
        this.isStarted=false;
        this.showFooter=true;
        this.can_play=true;
      }
    },2000)
  }

  cancel(){
    this.total_gain=0;
    this.total_partie=0;
    this.isCountdown=false;
    clearInterval(this.countdownInterval);
    this.chiffre=3;
    this.isStarted=false;
    this.isCrashed=false;
    this.auto=false;
    this.can_play=true;
    this.showFooter=true;
  }

  close(){
    this.admob.showInterstitial();
    this.navCtrl.navigateRoot('/game');
  }

  stopGame() {
    clearInterval(this.interval);
    if (!this.isCrashed) {
      //this.util.doToast('Vous avez encaissé avant le crash! Le multiplicateur était de  ' + this.multiplier.toFixed(2),5000,'medium','top');
      this.isWin=true;
      // ajout des points
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
    },q=>{
      this.util.handleError(q);
    })
  }


  async win(){
    this.user.point = this.user.point+this.mise*this.user_multiplier;
    const opt ={
      level:this.user_multiplier,
      user_id:this.user.id,
      game_id:this.game.id,
      jackpot:this.mise*this.user_multiplier,
      is_winner:true
    };

    this.api.post('scores',opt).then(d=>{
      this.titre = "VOUS AVEZ GAGNEZ !!!";
      this.message ="Vous avez gagnez "+opt.jackpot+" W. Vos points ont été crédités sur votre compte";
      this.showMessage=true;
      if(this.auto){
        this.total_gain+=opt.jackpot;
        setTimeout(()=>{
          this.startGame();
        },2000);
      } else {
        this.total_partie=0;
        this.total_gain=0;
        this.isStarted=false;
        this.showFooter=true;
      }
    },q=>{
      this.util.handleError(q);
    });

  }




  getSeries(count){
    let numbers = [];

    // Define the percentage distributions
    let percentages = {
      "lessThan1": 0.1,  // 60% < 1
      "lessThan2": 0.1,  // 24% < 2
      "lessThan5": 0.4,  // 10% < 5
      "lessThan10": 0.4, // 5% < 10
      "greaterThan10": 0.1 // 1% > 10
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
      numbers.push(this.randomInRange(10, 50));
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

    let nbZeros = Math.floor(X * 0.6); // Calcul du nombre de 0 (70%)
    if(mise){
      nbZeros = Math.floor(X * 0.8)
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
