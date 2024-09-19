import { Component, OnInit } from '@angular/core';
import {AlertController, NavController} from "@ionic/angular";
import {UtilProvider} from "../../../providers/util/util";
import {ApiProvider} from "../../../providers/api/api";
import {AuthProvider} from "../../../providers/auth/auth";
import {AdmobProvider} from "../../../providers/admob/AdmobProvider";

@Component({
  selector: 'app-plusmoins',
  templateUrl: './plusmoins.page.html',
  styleUrls: ['./plusmoins.page.scss'],
})
export class PlusmoinsPage implements OnInit {

  gain = 0;
  face = 0;
  mise = 50;
  choix = '';

  dice_result = 0;

  milestone=[];

  points: any[] = new Array(10); // 10 points pour la timeline

  isStarted = false;
  isLoose = false;

  isConnected = true;
  showLoading=true;
  showFooter=true;
  titre="";
  message="";
  showMessage=false;
  isFirstTime=true;

  private finals=[];
  private index=0;
  private indexMilestone=0;
  private decision=0;

  user:any={};
  game:any={};

  private percent=0;

  cube: HTMLElement;
  cube2: HTMLElement;

  constructor(
    public navCtrl: NavController,
    private util:UtilProvider,
    private api:ApiProvider,
    private auth:AuthProvider,
    private admob:AdmobProvider,
  ) {
    // Assurez-vous que l'élément cube est chargé après l'initialisation du composant
    setTimeout(() => {
      this.cube = document.getElementById('cube') as HTMLElement;
      this.cube2 = document.getElementById('cube2') as HTMLElement;
    }, 0);
  }

  ngOnInit() {
    this.admob.loadInterstitial();

  }

  ionViewWillEnter(){
    if(this.api.checkUser()){
      this.api.getList('auth/me',{id:this.user.id}).then((a:any)=>{
        this.user = a.data.user;
        localStorage.setItem('user_ka',JSON.stringify(this.user));
      },q=>{
        this.util.handleError(q);
      });
    } else {

    }
    this.getGame();
    this.api.getSettings().then((d:any)=>{
      if(d){
        this.milestone = d.game_settings.plusmoins.points;
        this.percent = d.game_settings.plusmoins.percent;
        //this.percent=0;
        this.finals= this.genererTableau(50);
        this.showLoading=false;
        //console.log(this.percent,this.finals);
        //console.log(this.milestone);
      }
    })
  }

  ionViewWillLeave(){
    this.admob.showInterstitial();
  }

  choice(choix){
    if(!this.isStarted){
      this.choix=choix;
    }
  }

  startGame() {
    this.gain=0;
    if(this.choix==""){
      this.util.doToast('Vous n\'avez pas choisi le résultat des dé',2000);
    } else {
      this.showMessage=false;
      if(this.user.point==undefined || this.user.point<this.mise){
        this.util.doToast('Pas assez de point pour commencer à jouer. Veuillez contacter le katika depuis votre compte',5000);
        this.isStarted=false;
        this.showFooter=true;
      } else {
        if(this.isConnected){
          const opt ={
            user_id:this.user.id,
            game_id:this.game.id,
            mise:this.mise
          };

          this.api.post('start_game',opt).then(a=>{
            this.user.point-=this.mise;
            this.isStarted=true;
            this.showFooter=false;

            this.decision = this.finals[this.index];
            if(this.index==this.finals.length-1){
              this.finals= this.genererTableau(50);
              this.index=0;
            }

            this.rollDice();
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

  }

  rollDice() {

    let face = parseInt(this.util.randomInRange(6,1)+'');
    let face2 = parseInt(this.util.randomInRange(6,1)+'');
    while(this.face == face){
      face = parseInt(this.util.randomInRange(6,1)+'');
    }

    if(this.decision==0){
      if(this.choix=='egal'){
        while(face+face2==7){
          face = parseInt(this.util.randomInRange(6,1)+'');
          face2 = parseInt(this.util.randomInRange(6,1)+'');
        }
      } else if (this.choix=='moins'){
        while(face+face2<7){
          face = parseInt(this.util.randomInRange(6,1)+'');
          face2 = parseInt(this.util.randomInRange(6,1)+'');
        }
      } else if (this.choix=='plus'){
        while(face+face2>7){
          face = parseInt(this.util.randomInRange(6,1)+'');
          face2 = parseInt(this.util.randomInRange(6,1)+'');
        }
      }
    } else {
      if(this.mise>2000){
        if(this.choix=='egal'){
          while(face+face2==7){
            face = parseInt(this.util.randomInRange(6,1)+'');
            face2 = parseInt(this.util.randomInRange(6,1)+'');
          }
        } else if (this.choix=='moins'){
          while(face+face2<7){
            face = parseInt(this.util.randomInRange(6,1)+'');
            face2 = parseInt(this.util.randomInRange(6,1)+'');
          }
        } else if (this.choix=='plus'){
          while(face+face2>7){
            face = parseInt(this.util.randomInRange(6,1)+'');
            face2 = parseInt(this.util.randomInRange(6,1)+'');
          }
        }
      }
    }


    this.face = face;
    this.dice_result = face+face2;

    // Définir les angles pour chaque face du dé
    const rotations: { [key: number]: { x: number, y: number } } = {
      1: { x: 0, y: 0 },
      2: { x: 0, y: -90 },
      3: { x: 0, y: -180 },
      4: { x: 0, y: 90 },
      5: { x: 90, y: 0 },
      6: { x: -90, y: 0 }
    };

    // Vérifier si la face est valide
    if (!rotations[face]) {
      console.error("La face du dé n'existe pas !");
      return;
    }

    // Calculer les angles pour chaque face
    const { x, y } = rotations[face];
    const f = rotations[face2];
    const spins = 10; // Nombre de rotations complètes
    const duration = 2000; // Durée totale en secondes
    const start = performance.now(); // Début de l'animation

    // Rotation initiale
    let currentRotationX = 0;
    let currentRotationY = 0;

    let currentRotationX2 = 0;
    let currentRotationY2 = 0;

    const animate = (time: number) => {
      const elapsed = time - start;
      const progress = Math.min(elapsed / duration, 1); // Progrès de l'animation

      // Calcul de la rotation
      const rotationX = currentRotationX + spins * 360 * progress + x * progress;
      const rotationY = currentRotationY + spins * 360 * progress + y * progress;

      const rotationX2 = currentRotationX2 + spins * 360 * progress + x * progress;
      const rotationY2 = currentRotationY2 + spins * 360 * progress + y * progress;

      // Appliquer la transformation
      this.cube.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg) translateZ(0)`;
      setTimeout(()=>{
        this.cube2.style.transform = `rotateX(${rotationX2}deg) rotateY(${rotationY2}deg) translateZ(0)`;
      },100);

      // Continuer tant que l'animation n'est pas terminée
      if (progress < 1) {
        window.requestAnimationFrame(animate); // Utilisation correcte dans une classe TypeScript
      } else {
        // Fin de l'animation
        this.cube.style.transform = `rotateX(${x}deg) rotateY(${y}deg) translateZ(0)`;
        setTimeout(()=>{
          this.cube2.style.transform = `rotateX(${f.x}deg) rotateY(${f.y}deg) translateZ(0)`;
        },100);
        setTimeout(()=>{
          this.checkState();
        },500);
      }
    };

    // Lancer l'animation
    window.requestAnimationFrame(animate);

    this.index++;
  }

  checkState(){
    if(7==this.dice_result && this.choix=='egal'){
      this.indexMilestone=1;
      this.win();
    } else if(this.dice_result<7 && this.choix=='moins'){
      this.indexMilestone=0;
      this.win();
    } else if(this.dice_result>7 && this.choix=='plus'){
      this.indexMilestone=2;
      this.win();
    } else {
      this.loose();
    }
    this.showFooter=true;
  }

  async win(){
    const info = {
      choix_decision:this.choix,
      dice_result:this.dice_result,
      gain:this.mise*this.milestone[this.indexMilestone],
      milestone:this.indexMilestone,
      mise:this.mise
    };
    const opt ={
      level:10,
      user_id:this.user.id,
      game_id:this.game.id,
      jackpot:this.mise*this.milestone[this.indexMilestone],
      is_winner:true,
      info:JSON.stringify(info)
    };
    
    this.gain=this.mise*this.milestone[this.indexMilestone];
    
    this.api.post('scores',opt).then(d=>{
      this.titre = "VOUS AVEZ GAGNEZ !!!";
      this.message ="Vous avez gagnez "+this.gain+" W. Vos points ont été crédités sur votre compte";
      this.showMessage=true;
      this.showFooter=true;
      this.isStarted=false;
      this.ionViewWillEnter();
    },q=>{
      this.util.handleError(q);
    });
  }

  async loose(){
    this.titre = "Vous avez perdu";
    this.message ="Pas de chance, peut-être une prochaine fois 😭😭😭";
    this.showMessage=true;
    this.isStarted=false;
    this.showFooter=true;
    this.ionViewWillEnter();
  }

  close(){
    this.admob.showInterstitial();
    this.navCtrl.navigateRoot('/game');
  }

  closeMessage(event: string){
    this.showMessage=false;
  }

  getGame(){
    const opt={
      name:'Plus ou Moins'
    };
    this.api.getList('games',opt).then((d:any)=>{
      this.game=d[0];
      if(this.isFirstTime){
        this.showRule();
        this.mise = this.game.fees;
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

  genererTableau(X: number): number[] {
    const tableau: number[] = [];

    let nbZeros = Math.floor(X * this.percent); // Calcul du nombre de 0 (70%)
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
