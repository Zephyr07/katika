import { Component, OnInit } from '@angular/core';
import {UtilProvider} from "../../../providers/util/util";
import {NavController} from "@ionic/angular";
import {ApiProvider} from "../../../providers/api/api";
import {AuthProvider} from "../../../providers/auth/auth";
import {AdmobProvider} from "../../../providers/admob/AdmobProvider";

@Component({
  selector: 'app-machine5x',
  templateUrl: './machine5x.page.html',
  styleUrls: ['./machine5x.page.scss'],
})
export class Machine5xPage implements OnInit {

  reels: string[] = ['♠️', '♥️','♣️', '♦️', '🏅','💰','👑','💎']; // Symbols on the reel
  //reels: string[] = ['♠️', '♥️','♣️', '♦️', '🌑','🌒','🌔','🌕']; // Symbols on the reel
  //reels: string[] = ['🌑', '🌒️','🌓', '🌔','🌖','🌗','🌘','🌕']; // Symbols on the reel
  slots: string[][] = [[], [], [], [], []]; // Three arrays for each reel
  reelPositions: number[] = [0, 0, 0, 0, 0]; // Current positions for each reel
  spinning: boolean = false; // Spin state
  private targetIndexes: number[] = [0, 0, 0, 0, 0]; // Target positions for the reels
  private times: number[] = [2000, 2500, 3000, 2500, 3000]; // Target positions for the reels
  spinningReel: boolean[] = [false, false, false, false, false]; // Target positions for the reels
  match: boolean[] = [false, false, false, false, false]; // Target positions for the reels

  user_name="";
  user_point:number;
  isStarted=false;
  auto=false;

  count=20;
  user_multiplier=1;
  score=0;

  countdownInterval:any;
  mise:number;
  showLoading=true;

  isConnected = true;
  showFooter=true;
  titre="";
  message="";
  showMessage=false;
  isFirstTime=true;

  private user:any={};
  game:any={};

  private uscore = 0;
  private USCORE = 0;
  private index = 0;
  private old_x=0;
  private x=[0,0,0,0,0];

  private interval:any;

  chiffre=2; // valeur du countdown
  isCountdown=false;
  points:any=[];
  private finals:any=[];
  private percent=0;


  constructor(
    public navCtrl: NavController,
    private util:UtilProvider,
    private api:ApiProvider,
    private auth:AuthProvider,
    private admob:AdmobProvider
  ) {
    this.initializeReels();
  }

  ngOnInit(){
    this.getGame();
    this.admob.loadInterstitial();
    this.api.getSettings().then((d:any)=>{
      this.percent=d.game_settings.bigslot.percent;
      this.USCORE=d.USCORE;
      this.points=d.game_settings.bigslot.points;
      //this.percent=0;

      this.finals= this.genererTableau(this.count);

      //console.log(this.finals);
      //console.log(this.series);
    })
  }

  ionViewWillEnter(){

    if(this.api.checkUser()){
      this.api.getList('auth/me',{id:this.user.id}).then((a:any)=>{
        this.user = a.data.user;
        this.user_point = this.user.point;
        this.user_name = this.user.user_name;
        localStorage.setItem('user_ka',JSON.stringify(this.user));
      },q=>{
        this.util.handleError(q);
      });
    } else {

    }
  }

  ionViewWillLeave(){
    this.admob.showInterstitial();
    clearInterval(this.countdownInterval);
  }

  startGame() {
    this.match=[false,false,false,false,false];
    this.showFooter=false;
    this.showMessage=false;
    if(this.mise>=this.game.fees){

      if(this.user.point==undefined || this.user.point<this.mise){
        this.util.doToast('Pas assez de point pour commencer à jouer. Veuillez contacter le katika depuis votre compte',5000);
        this.isCountdown=false;
        clearInterval(this.countdownInterval);
        this.chiffre=5;
        this.isStarted=false;
        this.auto=false;
        this.showFooter=true;
      } else {
        this.showFooter=false;
        if(this.auto){
          this.showFooter=false;
          this.isCountdown=true;
          this.chiffre=3;
          this.countdownInterval = setInterval(()=>{
            this.chiffre--;
            if(this.chiffre==0){
              this.start();
            }
            if(this.chiffre==-1){
              this.isCountdown=false;
              clearInterval(this.countdownInterval);
            }
          },1000);
        } else {
          this.start();
        }
      }
    } else {
      
      this.showMessage=true;
      this.showFooter=true;
      this.titre="Mise insuffisante";
      this.message="La mise doit être comprise entre "+this.game.fees+" et 10 000";
    }
  }

  start(){
    const opt ={
      user_id:this.user.id,
      game_id:this.game.id,
      mise:this.mise*this.user_multiplier
    };

    this.api.post('start_game',opt).then((a:any)=>{
      
      this.uscore=a;
      this.user_point-=this.mise*this.user_multiplier;
      this.isCountdown=false;
      this.spin();
    },q=>{
      console.log(q);
      this.util.handleError(q);
      this.showFooter=true;
    });
  }

  cancel(){
    this.isCountdown=false;
    clearInterval(this.countdownInterval);
    this.chiffre=3;
    this.user_multiplier=1;
    this.isStarted=false;
    this.auto=false;
    this.showFooter=true;
  }

  close(){
    this.navCtrl.navigateRoot('/game');
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
      name:'Ace Slots'
    };
    this.api.getList('games',opt).then((d:any)=>{
      this.game=d[0];
      this.mise = this.game.fees;
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
    const info ={
      mise:this.mise,
      point:this.score,
      multiplier:this.user_multiplier,
      motif:this.reels[this.targetIndexes[0]]+this.reels[this.targetIndexes[1]]+this.reels[this.targetIndexes[2]]+this.reels[this.targetIndexes[3]]+this.reels[this.targetIndexes[4]]
    };
    const opt ={
      level:1,
      user_id:this.user.id,
      game_id:this.game.id,
      jackpot:this.score,
      is_winner:true,
      info:JSON.stringify(info)
    };

    this.api.post('scores',opt).then(d=>{
      this.titre = "VOUS AVEZ GAGNEZ !!!";
      this.message ="Vous avez gagnez "+opt.jackpot+" W. Vos points ont été crédités sur votre compte";
      this.showMessage=true;
      this.isStarted=false;
      this.ionViewWillEnter();
      if(this.auto){
        setTimeout(()=>{
          this.startGame();
        },2000);
      } else {
        this.showFooter=true;
      }
    },q=>{
      this.showFooter=true;
      this.util.handleError(q);
    });
  }

  genererTableau(X: number,mise?:number): number[] {
    const tableau: number[] = [];

    let nbZeros = Math.floor(X * this.percent); // Calcul du nombre de 0 (70%)
    //let nbZeros = Math.floor(X * 1); // Calcul du nombre de 0 (70%)
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

  initializeReels() {
    for (let i = 0; i < 5; i++) {
      this.slots[i] = [...this.reels, ...this.reels, ...this.reels, ...this.reels, ...this.reels]; // Repeat symbols for smooth looping
      //this.slots[i]=this.util.shuffleArray(this.slots[i]);
    }
  }

  // Spin the slot machine to the specified target indexes

  spin() {
    this.initializeReels();
    this.message="";
    if (this.spinning) return; // Prevent multiple spins at the same time


    let target = [
      this.util.randomIntInRange(0,this.reels.length-1),
      this.util.randomIntInRange(0,this.reels.length-1),
      this.util.randomIntInRange(0,this.reels.length-1),
      this.util.randomIntInRange(0,this.reels.length-1),
      this.util.randomIntInRange(0,this.reels.length-1)
    ];

    if(this.index==this.finals.length-1){
      this.finals= this.genererTableau(this.count);
      this.index=0;
    }
    //console.log(this.finals[this.index],target);

    if(this.uscore>this.USCORE && !this.game.is_challenge){
      target = [
        this.util.randomIntInRange(0,3),
        this.util.randomIntInRange(4,7),
        this.util.randomIntInRange(0,3),
        this.util.randomIntInRange(4,7),
        this.util.randomIntInRange(0,3),
      ];
    } else {
      if(this.finals[this.index]==1){
        if(this.mise>=1000 && this.mise<5000){
          // il ne peux que gagner x1
          target = [
            this.util.randomIntInRange(0,1),
            this.util.randomIntInRange(0,1),
            this.util.randomIntInRange(0,2),
            this.util.randomIntInRange(0,1),
            this.util.randomIntInRange(0,1),
          ]
        } else if(this.mise>=5000) {
          // perdu
          target = [
            this.util.randomIntInRange(0,3),
            this.util.randomIntInRange(4,7),
            this.util.randomIntInRange(0,3),
            this.util.randomIntInRange(4,7),
            this.util.randomIntInRange(0,3),
          ];
        } else {
          if(!this.checkTarget(target)){
            let x = 0;
            while(x==this.old_x){
              x = this.util.randomIntInRange(0,this.reels.length-4);
            }
            target = [x,x,(target[0]+1)%this.reels.length,(target[0]+2)%this.reels.length,(target[0]+3)%this.reels.length];
            this.old_x = x;
          } else {
            // il gagne déjà
          }

        }

      } else {
        if(this.checkTarget(target)){
          target = [
            this.util.randomIntInRange(0,3),
            this.util.randomIntInRange(4,7),
            this.util.randomIntInRange(0,3),
            this.util.randomIntInRange(4,7),
            this.util.randomIntInRange(0,3),
          ];
        } else {
          const x = this.util.randomIntInRange(0,2);
          const y = this.util.randomIntInRange(0,2);
          target=[
            this.util.randomIntInRange(3,5),
            x,
            y,
            this.util.randomIntInRange(6,7),
            this.util.randomIntInRange(3,5),
          ];
        }
      }
    }
    this.index+=1;
    this.targetIndexes = target;
    for (let i = 0; i < 5; i++) {
      this.spinningReel[i]=true;
    }
    this.spinToTarget(target);
    this.interval = setInterval(()=>{
      if(this.spinningReel[0]==false && this.spinningReel[1]==false && this.spinningReel[2]==false && this.spinningReel[3]==false && this.spinningReel[4]==false){
        clearInterval(this.interval);
        this.checkWin();
      } else {
        // on ne fait rien
      }
    },500)
  }

  // Spin a single reel
  spinReel(reelIndex: number, targetIndex: number) {
    const totalSymbols = this.slots[reelIndex].length;
    const currentPos = this.reelPositions[reelIndex];
    const extraSpins = 3; // Ensure the reel spins at least 10 times
    let spins = extraSpins * totalSymbols + targetIndex;

    // Adjust spins to make sure we complete the loop and stop exactly at the targetIndex
    if (currentPos <= targetIndex) {
      spins += targetIndex - currentPos;
    } else {
      spins += totalSymbols - (currentPos - targetIndex);
    }

    const spinSpeed = 100; // Speed of the reel movement (ms)
    let currentPosition = currentPos;

    const spinInterval = setInterval(() => {
      currentPosition = (currentPosition + 1) % totalSymbols;
      this.reelPositions[reelIndex] = currentPosition;
    }, spinSpeed);

    // Stop the reel after it completes the correct number of spins
    setTimeout(() => {
      clearInterval(spinInterval);
      this.reelPositions[reelIndex] = targetIndex; // Stop at the exact position
      //this.checkIfAllReelsStopped();
    }, spins * spinSpeed);
  }

  async spinToTarget(target:number[]){
    // reel 1
    const interval1 = setInterval(()=>{
      // ça tourne jusqu'a ce que apres le temps, sa s'arrete au prochain indice choisi
      const totalSymbols = this.slots[0].length;
      let currentPosition = this.reelPositions[0];

      currentPosition = (currentPosition + 1) % totalSymbols;
      this.reelPositions[0] = currentPosition;

      this.x[0]+=100;
      if(this.x[0]>=this.times[0] && this.slots[0][(currentPosition+1)% totalSymbols]==this.reels[target[0]]){
        if(currentPosition<this.reels.length){
          currentPosition+=this.reels.length
        } else if(currentPosition>(this.slots[0].length-this.reels.length)){
          currentPosition-=this.reels.length
        }
        this.reelPositions[0] = currentPosition;
        // stop du time
        this.spinningReel[0]=false;
        clearInterval(interval1);
        this.x[0]=0;
      }
    },100);

    // reel 2
    const interval2 = setInterval(()=>{
      // ça tourne jusqu'a ce que apres le temps, sa s'arrete au prochain indice choisi
      const totalSymbols = this.slots[1].length;
      let currentPosition = this.reelPositions[1];

      currentPosition = (currentPosition + 1) % totalSymbols;
      this.reelPositions[1] = currentPosition;

      this.x[1]+=100;
      if(this.x[1]>=this.times[1] && this.slots[1][(currentPosition+1)% totalSymbols]==this.reels[target[1]]){
        if(currentPosition<this.reels.length){
          currentPosition+=this.reels.length
        } else if(currentPosition>(this.slots[1].length-this.reels.length)){
          currentPosition-=this.reels.length
        }
        this.reelPositions[1] = currentPosition;
        // stop du time
        this.spinningReel[1]=false;
        clearInterval(interval2);
        this.x[1]=0;
      }
    },100);

    // reel 3
    const interval3 = setInterval(()=>{
      // ça tourne jusqu'a ce que apres le temps, sa s'arrete au prochain indice choisi
      const totalSymbols = this.slots[2].length;
      let currentPosition = this.reelPositions[2];

      currentPosition = (currentPosition + 1) % totalSymbols;
      this.reelPositions[2] = currentPosition;

      this.x[2]+=100;
      if(this.x[2]>=this.times[2] && this.slots[2][(currentPosition+1)% totalSymbols]==this.reels[target[2]]){
        if(currentPosition<this.reels.length){
          currentPosition+=this.reels.length
        } else if(currentPosition>(this.slots[2].length-this.reels.length)){
          currentPosition-=this.reels.length
        }
        this.reelPositions[2] = currentPosition;
        // stop du time
        this.spinningReel[2]=false;
        clearInterval(interval3);
        this.x[2]=0;
      }
    },100);
    
    // reel 4
    const interval4 = setInterval(()=>{
      // ça tourne jusqu'a ce que apres le temps, sa s'arrete au prochain indice choisi
      const totalSymbols = this.slots[3].length;
      let currentPosition = this.reelPositions[3];

      currentPosition = (currentPosition + 1) % totalSymbols;
      this.reelPositions[3] = currentPosition;

      this.x[3]+=100;
      if(this.x[3]>=this.times[3] && this.slots[3][(currentPosition+1)% totalSymbols]==this.reels[target[3]]){
        if(currentPosition<this.reels.length){
          currentPosition+=this.reels.length
        } else if(currentPosition>(this.slots[3].length-this.reels.length)){
          currentPosition-=this.reels.length
        }
        this.reelPositions[3] = currentPosition;
        // stop du time
        this.spinningReel[3]=false;
        clearInterval(interval4);
        this.x[3]=0;
      }
    },100);
    
    // reel 5
    const interval5 = setInterval(()=>{
      // ça tourne jusqu'a ce que apres le temps, sa s'arrete au prochain indice choisi
      const totalSymbols = this.slots[4].length;
      let currentPosition = this.reelPositions[4];

      currentPosition = (currentPosition + 1) % totalSymbols;
      this.reelPositions[4] = currentPosition;

      this.x[4]+=100;
      if(this.x[4]>=this.times[4] && this.slots[4][(currentPosition+1)% totalSymbols]==this.reels[target[4]]){
        if(currentPosition<this.reels.length){
          currentPosition+=this.reels.length
        } else if(currentPosition>(this.slots[4].length-this.reels.length)){
          currentPosition-=this.reels.length
        }
        this.reelPositions[4] = currentPosition;
        // stop du time
        this.spinningReel[4]=false;
        clearInterval(interval5);
        this.x[4]=0;
      }
    },100);
  }

  checkTarget(target){
    const a = target[0];
    const b = target[1];
    const c = target[2];
    const d = target[3];
    const e = target[4];
    let bool = false;
    if(a==b && a==c && a==d && a==e){
      bool=true;
    } else if((a==b && a==c && a==d) || (b==c && b==d && b==e)){
      bool=true;
    } else if((a==b && a==c) || (b==c && b==d)|| (c==d && d==e)){
      bool=true;
    } else if ((a==b)||(b==c)||(c==d)|| (d==e)){
      bool=true;
    }

    return bool;
  }

  // Check if the player has won
  async checkWin() {
    this.isStarted=false;
    const a = this.targetIndexes[0];
    const b = this.targetIndexes[1];
    const c = this.targetIndexes[2];
    const d = this.targetIndexes[3];
    const e = this.targetIndexes[4];

    let score = 0;
    // 5
    if(a==b && a==c && a==d && a==e){
      score+= this.points[a]*5;
      this.match=[true,true,true,true,true];
    } else if((a==b && a==c && a==d) || (b==c && b==d && b==e)){
      if(a==b && a==c && a==d){
        score+= this.points[a]*4;
        this.match=[true,true,true,true,false];
      } else {
        score+= this.points[b]*4;
        this.match=[false,true,true,true,true];
      }
    } else if((a==b && a==c) || (b==c && b==d)|| (c==d && d==e)){
      if((a==b && a==c)){
        score+= this.points[a]*3;
        this.match=[true,true,true,false,false];

        if(d==e){
          score+= this.points[d]*3;
          this.match=[true,true,true,true,true];
        }
      } else if (b==c && b==d){
        score+= this.points[b]*3;
        this.match=[false,true,true,true,false];
      } else {
        score+= this.points[c]*3;
        this.match=[false,false,true,true,true];
        if(a==b){
          score+= this.points[d]*3;
          this.match=[true,true,true,true,true];
        }
      }

    } else if ((a==b)||(b==c)||(c==d)|| (d==e)){
      if(a==b){
        score+= this.points[a]*2;
        this.match[0]=true;
        this.match[1]=true;
      }
      if (b==c){
        score+= this.points[b]*2;
        this.match[1]=true;
        this.match[2]=true;
      }
      if(c==d){
        score+= this.points[c]*2;
        this.match[2]=true;
        this.match[3]=true;
      }
      if(d==e){
        score+= this.points[d]*2;
        this.match[3]=true;
        this.match[4]=true;
      }
    }

    this.score=score*this.user_multiplier;
    if(this.score>=this.game.fees*this.user_multiplier){
      this.win();
    } else {
      if(this.auto){
        setTimeout(()=>{
          if(this.auto){
            this.startGame();
          }
        },500);
      } else {
        this.showFooter=true;
      }
    }
  }

}
