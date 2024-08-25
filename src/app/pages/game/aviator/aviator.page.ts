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

  user_multiplier:number;
  mise=0;
  private timeInterval=100;
  multiplier: number = 1;
  private crashTime: number = 0;
  isCrashed: boolean = false;
  //private successRate: number = Math.random() * 100; // Random success rate
  airplaneImage: string = 'assets/img/avatar.svg'; // Path to airplane image
  interval:any;
  is_win=false;
  isStarted=false;
  private series=[];
  private index=0;

  is_user=false;
  pub=false;
  user:any={};
  game:any={};
  private target =0;

  constructor(
    public navCtrl: NavController,
    private util:UtilProvider,
    private api:ApiProvider,
    private auth:AuthProvider,
    private admob:AdmobProvider,
    private alertController:AlertController
  ) {
    this.series = this.getSeries(100);
  }

  ngOnInit(){
    //let series = this.generateSeries();
    this.getGame();
  }

  ionViewWillEnter(){
    this.admob.showBanner('top',80);
    this.admob.loadInterstitial();
    if(this.api.checkUser()){
      this.is_user=true;
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
    if(this.user_multiplier!=undefined && this.user_multiplier>1.01){
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
        const index = Math.floor(Math.random() * this.series.length);
        this.target = this.series[index];
        this.index++;
        this.mise=50;
        this.isStarted=true;
        this.is_win = false;
        this.isCrashed = false;
        this.multiplier = 1;
        this.crashTime = Math.floor(Math.random() * 10000) + 5000; // Crash time between 5 to 15 seconds
        //this.crashTime = Math.random() * (3 - 1);
        this.increaseMultiplier();
      }
    } else {
      this.util.doToast('Vous n\'avez pas renseinger de multiplicateur',3000,'tertiary');
    }

  }

  x=0;

  increaseMultiplier() {
    this.interval = setInterval(() => {

      if (this.isCrashed) {
        clearInterval(this.interval);
        return;
      }
      /*if(this.x>=5000 && this.x<8000){
        this.multiplier+=0.01;
      } else if(this.x>=8000){
        this.multiplier+=0.015;
      }*/

      if(this.x>=0 && this.x<3000){
        // apres une seconde le multiplicateur change
        this.multiplier+=0.01;
      } else if(this.x>=3000 && this.x<10000){
        this.multiplier+=0.02;
      } else if(this.x>=10000 && this.x<20000){
        this.multiplier+=0.03;
      } else if(this.x>=20000 && this.x<40000){
        this.multiplier+=0.04;
      } else {
        this.multiplier+=0.05;
      }
      this.x+=this.timeInterval;

      if(this.multiplier>this.target){
        //this.multiplier-=0.01;
        this.crash();
        clearInterval(this.interval);
      }

      if(this.multiplier>=this.user_multiplier){
        // victoire
        this.stopGame();
      }
      /*/this.multiplier += 0.01; // Increase multiplier every second
      this.successRate = Math.random() * 100; // Update success rate
      if (this.successRate < 10) {
        this.multiplier-=0.01;
        this.crash();
        clearInterval(this.interval);
      }*/
    }, this.timeInterval);
  }

  crash() {
    this.isCrashed = true;
    this.isStarted=false;
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
    const opt ={
      level:this.user_multiplier,
      user_id:this.user.id,
      game_id:this.game.id,
      jackpot:this.mise*this.user_multiplier,
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

  generateSeries() {
    let series = [];
    let count = 1000;
    let zeroCount = Math.floor(count * 0.20); // 20% de zéros
    let lowerCount = Math.floor(count * 0.60); // 60% des nombres < 2 (hors 0)
    let upperCount = count - zeroCount - lowerCount; // 20% des nombres ≥ 2

    // Ajout des zéros
    for (let i = 0; i < zeroCount; i++) {
      series.push(0);
    }

    // Génération des nombres < 2 (hors 0)
    for (let i = 0; i < lowerCount; i++) {
      let num = parseFloat((Math.random() * 2).toFixed(2)); // Génère un nombre aléatoire entre 0 et 2 avec 2 chiffres après la virgule
      if (num > 0) {
        series.push(num); // Ajouter à la série si supérieur à 0
      } else {
        i--; // Réessayer si le nombre est 0 (car on veut éviter de répéter 0 ici)
      }
    }

    // Génération des nombres ≥ 2 et < 4.99
    for (let i = 0; i < upperCount; i++) {
      let num = parseFloat((2 + Math.random() * 2.99).toFixed(2)); // Génère un nombre aléatoire entre 2 et 4.99 avec 2 chiffres après la virgule
      series.push(num);
    }

    // Mélange de la série pour répartir aléatoirement les nombres
    series = series.sort(() => Math.random() - 0.5);

    return series;
  }

  getSeries(count){
    let numbers = [];

    // Define the percentage distributions
    let percentages = {
      "lessThan1": 0.6,  // 60% < 1
      "lessThan2": 0.24,  // 24% < 2
      "lessThan5": 0.1,  // 10% < 5
      "lessThan10": 0.05, // 5% < 10
      "greaterThan10": 0.01 // 1% > 10
    };

    // Calculate how many numbers we need for each range
    let limits = {
      "lessThan1": Math.floor(count * percentages.lessThan1),
      "lessThan2": Math.floor(count * percentages.lessThan2),
      "lessThan5": Math.floor(count * percentages.lessThan5),
      "lessThan10": Math.floor(count * percentages.lessThan10),
      "greaterThan10": Math.floor(count * percentages.greaterThan10)
    };

    // Helper function to generate random numbers within a range with 2 decimals
    function randomInRange(min, max) {
      return parseFloat((Math.random() * (max - min) + min).toFixed(2));
    }

    // Generate numbers based on the ranges

    for (let i = 0; i < limits.lessThan2; i++) {
      numbers.push(randomInRange(2, 2.99));
    }

    for (let i = 0; i < limits.lessThan5; i++) {
      numbers.push(randomInRange(3, 5));
    }

    for (let i = 0; i < limits.lessThan1; i++) {
      numbers.push(randomInRange(1, 1.99));
    }

    for (let i = 0; i < limits.lessThan10; i++) {
      numbers.push(randomInRange(6, 10));
    }

    for (let i = 0; i < limits.greaterThan10; i++) {
      numbers.push(randomInRange(10, 50));
    }

    // If the total number of numbers is less than count due to rounding, fill up the remainder with random <1 numbers
    while (numbers.length < count) {
      numbers.push(randomInRange(0, 1));
    }

    // Mélange de la série pour répartir aléatoirement les nombres
    numbers = this.shuffleArray(numbers);
    return numbers;
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

  getSeriesFormServer(){
    // recuperation des series et de la position et du statut du jeu (si encours ou à l'arret)
  }
}
