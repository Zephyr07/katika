import { Component, OnInit } from '@angular/core';
import {ApiProvider} from "../../../providers/api/api";
import {UtilProvider} from "../../../providers/util/util";
import {AlertController, NavController} from "@ionic/angular";
import {AdmobProvider} from "../../../providers/admob/AdmobProvider";
import anime from 'animejs';

@Component({
  selector: 'app-multiplicator',
  templateUrl: './multiplicator.page.html',
  styleUrls: ['./multiplicator.page.scss'],
})
export class MultiplicatorPage implements OnInit {
  private user:any={};
  user_point = 0;
  user_name ="";
  is_user = false;
  game:any={};

  private texts = [];

  private finals=[];
  private count = 30;
  isStarted=false;

  index = 0;
  mise = 50;
  gain = 0;

  isConnected=true;
  showFooter=true;
  titre="";
  message="";
  showMessage=false;
  isFirstTime=true;

  win_p2=[];
  win_p=[];
  lost_p=[];

  showLoading=true;
  is_katika=true;

  private prices = [];
  private percent = 0;

  result:any={};

  private segmentCount = 21;
  highlightedSegment: number = -1;

  private recursif=0;

  // Créer segmentCount segments avec des couleurs différentes
  segments = [];
  constructor(
    private api:ApiProvider,
    private util:UtilProvider,
    public alertController:AlertController,
    public navCtrl:NavController,
    private admob:AdmobProvider
  ) {

  }

  private tab0=[];
  private tab1=[];
  private tab01=[];
  private tab02=[];
  private tab05=[];
  private tab010=[];
  private tab0100=[];

  ngOnInit() {
    this.admob.loadInterstitial();
    this.api.getSettings().then((d:any)=>{
      this.texts = d.game_settings.multiplicator.prices;
      this.percent = d.game_settings.multiplicator.percent;
      //this.percent=0.5;
      this.finals = this.genererTableau(this.count);
      for(let i=0;i<this.texts.length;i++){
        const x = parseInt(this.texts[i].split("x")[1]);
        if(x==0){
          this.tab0.push(i);
        }
        if(x==1){
          this.tab1.push(i);
        }
        if(x>=0 && x<=1){
          this.tab01.push(i);
        }
        if(x>=0 && x<=2){
          this.tab02.push(i);
        }
        if(x>=0 && x<=5){
          this.tab05.push(i);
        }
        if (x>=0 && x<=10){
          this.tab010.push(i);
        }
        if (x>=0 && x<=100){
          this.tab0100.push(i);
        }


        if(this.texts[i]=='x0'){
          this.lost_p.push(i);
        }
      }
      this.drawWheel();
      this.showLoading=false;
      //console.log(this.finals);

    });
  }

  ngAfterViewInit() {

  }

  ionViewWillEnter(){
    this.getGame();

    if(this.api.checkUser()){
      this.is_user=true;
      this.user=JSON.parse(localStorage.getItem('user_ka'));
      this.user_name=this.user.user_name;
      this.user_point=this.user.point;
      this.api.getList('auth/me',{id:this.user.id}).then((a:any)=>{
        this.user = a.data.user;
        this.user_name=this.user.user_name;
        this.user_point=this.user.point;
        localStorage.setItem('user_ka',JSON.stringify(this.user));
      });
    } else {
      this.is_user=false;
    }
  }

  close(){
    this.navCtrl.navigateRoot('/game');
  }

  getGame(){
    const opt={
      name:'Multiplicator'
    };
    this.api.getList('games',opt).then((d:any)=>{
      this.game=d[0];
      if(this.isFirstTime){
        this.mise = this.game.fees;
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
    const info={
      indice:this.highlightedSegment,
      gain:jackpot,
      mise:this.mise,
      multiplier:this.texts[this.highlightedSegment]
    };
    const opt ={
      level:10,
      user_id:this.user.id,
      game_id:this.game.id,
      jackpot,
      is_winner:true,
      info:JSON.stringify(info)
    };
    this.titre = "VOUS AVEZ GAGNEZ !!!";
    this.message ="Vous avez gagnez "+opt.jackpot+" W. Vos points ont été crédités sur votre compte";
    this.showMessage=true;
    this.api.post('scores',opt).then(d=>{
      this.ionViewWillEnter();
    },q=>{
      this.util.handleError(q);
    });
    //this.util.doToast("Felicitations, vous avez gagnez "+jackpot+" W",3000);
  }

  async loose(){
    this.titre = "Vous avez perdu";
    this.message ="Pas de chance, peut-être une prochaine fois 😭😭😭";
    this.showMessage=true;
    this.ionViewWillEnter();
  }

  startGame(){
    this.gain=0;
    this.showMessage=false;
    if(this.user.point==undefined || this.user.point<this.mise){
      this.util.doToast('Pas assez de W point pour commencer à jouer. Veuillez recharger votre compte',5000);
    } else {
      this.highlightedSegment=-1;
      this.drawWheel();
      if(this.isConnected){
        // debit
        const opt ={
          user_id:this.user.id,
          game_id:this.game.id
        };
        this.api.post('start_game',opt).then(a=>{
          this.user_point-=this.mise;
          this.showFooter=false;
          this.isStarted=true;
          this.result.prize=undefined;
          this.spinWheel();
        },q=>{
          this.util.handleError(q);
        });
      } else {
        this.showMessage=true;
        this.titre="Vous n'êtes pas connecté";
        this.message="Connectez-vous à internet pour continuer à jouer";
      }
    }
  }

  drawWheel() {
    const canvas = document.getElementById('wheelCanvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 30;
    const angleStep = (2 * Math.PI) / this.segmentCount; // L'angle de chaque segment

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const colors = [
      { start: "#0d6132", end: "#0d6132" },
      { start: "#c92e2b", end: "#c92e2b" },
      { start: "#FCD000", end: "#FCD000" },
    ];

    for (let i = 0; i < this.segmentCount; i++) {
      const startAngle = i * angleStep;
      const endAngle = startAngle + angleStep;

      // Couleur avec gradient pour chaque segment
      const gradient = ctx.createLinearGradient(centerX, centerY, centerX + radius, centerY + radius);
      if (i === this.highlightedSegment) {
        // mettre en blanc si surbruillance
        gradient.addColorStop(0, "#fff");
        gradient.addColorStop(1, "#fff");
        if(this.gain>=50){
          this.win(this.gain);
        }
      } else {
        gradient.addColorStop(0, colors[i % colors.length].start);
        gradient.addColorStop(1, colors[i % colors.length].end);
      }

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // Ajout d'un texte centré
      const textAngle = startAngle + angleStep / 2;
      const textRadius = radius * 0.65;

      const textX = centerX + Math.cos(textAngle) * textRadius;
      const textY = centerY + Math.sin(textAngle) * textRadius;

      ctx.save();
      ctx.translate(textX, textY);
      ctx.rotate(textAngle + Math.PI);
      ctx.fillStyle = "#000";
      ctx.font = "bold 18px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(this.texts[i], 0, 0);
      ctx.restore();
    }
    // Cercle extérieur
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 2, 0, 2 * Math.PI);
    ctx.strokeStyle = '#fff969';
    ctx.lineWidth = 10;
    ctx.stroke();
    ctx.closePath();

    // Ombre centrale pour effet 3D
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.2, 0, 2 * Math.PI);
    ctx.fillStyle = "rgba(252, 208, 0, 0.5)";
    ctx.fill();
    ctx.closePath();

    // Réinitialiser les propriétés d'ombre avant de dessiner l'effet 3D
    ctx.shadowColor = 'rgba(0, 0, 0, 0)';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Effet 3D ombré autour de la roue
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    //ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 10;
    ctx.shadowOffsetY = 10;
    ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
    ctx.stroke();

  }

  spinWheel() {
    const canvas = document.getElementById('wheelCanvas') as HTMLCanvasElement;

    const segmentAngle = 360 / this.segmentCount;
    const randomSegmentIndex = Math.floor(Math.random() * this.segmentCount);
    const angle = segmentAngle * randomSegmentIndex;
    const threeTurns = 360 * 3; // Trois tours complets
    const additionalTurns = 360 * (Math.floor(Math.random() * 5) + 3); // 3 à 7 tours supplémentaires
    const totalRotation = angle + threeTurns + additionalTurns; // Inclure trois tours et des tours supplémentaires
    // Animer la rotation de la roue
    anime({
      targets: canvas,
      rotate: {
        value: totalRotation,
        duration: 3000,
        easing: 'easeOutQuint',
      },
      complete: () => {
        this.showFooter = true;
        if(this.finals[this.index]==0){
          // perdu
          const x = this.util.randomIntInRange(0,this.tab01.length-1);
          this.highlightedSegment = this.tab01[x];
          if(this.recursif==3){
            this.recursif=1;
            const x = this.util.randomIntInRange(0,this.tab1.length-1);
            this.highlightedSegment = this.tab1[x];
          } else {
            const x = this.util.randomIntInRange(0,this.tab0.length-1);
            this.highlightedSegment = this.tab0[x];
            this.recursif++;
          }
        } else {
          // gain en fonction de la mise
          if(this.mise>=50 && this.mise<100){
            if(this.finals[this.index]==2){
              // on peut aller jusqu'a 100
              const x = this.util.randomIntInRange(0,this.tab0100.length-1);
              this.highlightedSegment = this.tab0100[x];
            } else {
              const x = this.util.randomIntInRange(0,this.tab010.length-1);
              this.highlightedSegment = this.tab010[x];
            }
          } else if(this.mise>=100 && this.mise<=500){
            const x = this.util.randomIntInRange(0,this.tab010.length-1);
            this.highlightedSegment = this.tab010[x];
          } else if(this.mise>500 && this.mise<=1000){
            const x = this.util.randomIntInRange(0,this.tab05.length-1);
            this.highlightedSegment = this.tab05[x];
          } else if(this.mise>1000 && this.mise<5000){
            const x = this.util.randomIntInRange(0,this.tab02.length-1);
            this.highlightedSegment = this.tab02[x];
          } else if (this.mise>=5000 && this.mise<10000){
            const x = this.util.randomIntInRange(0,this.tab01.length-1);
            this.highlightedSegment = this.tab01[x];
          } else if (this.mise>=10000){
            const x = this.util.randomIntInRange(0,this.tab0.length-1);
            this.highlightedSegment = this.tab0[x];
          }
        }
        this.isStarted=false;
        const multiplier = parseInt(this.texts[this.highlightedSegment].split('x')[1]);
        //console.log("apres",this.highlightedSegment,this.texts[this.highlightedSegment],multiplier);
        this.gain = this.mise * multiplier;
        this.index++;
        if(this.index==this.finals.length){
          this.finals=this.genererTableau(this.count);
          this.index=0;
        }

        this.drawWheel(); // Redessiner la roue pour mettre en surbrillance le segment
      },
    });
  }

  genererTableau(X: number): number[] {
    const tableau: number[] = [];

    const nbZeros = Math.floor(X * this.percent); // Calcul du nombre de 0 (70%)
    const nbUn = X - nbZeros-2; // Le reste sera des 1

    // Ajouter 0 au tableau
    for (let i = 0; i < nbZeros; i++) {
      tableau.push(0);
    }

    // Ajouter 1 au tableau
    for (let i = 0; i < nbUn; i++) {
      tableau.push(1);
    }

    tableau.push(2);
    tableau.push(2);
    // Mélanger le tableau de manière aléatoire pour répartir les 0 et 1
    for (let i = tableau.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tableau[i], tableau[j]] = [tableau[j], tableau[i]]; // Échange des éléments
    }

    return tableau;
  }

}
