import {Component, OnInit} from '@angular/core';
import {UtilProvider} from "../../../providers/util/util";
import {AlertController, NavController} from "@ionic/angular";
import {ApiProvider} from "../../../providers/api/api";
import {AuthProvider} from "../../../providers/auth/auth";
import {AdmobProvider} from "../../../providers/admob/AdmobProvider";

@Component({
  selector: 'app-dice',
  templateUrl: './dice.page.html',
  styleUrls: ['./dice.page.scss'],
})
export class DicePage implements OnInit {

  face = 0;
  choix_result = 0;
  choix_decision = "";
  gain_tmp = 0;
  level = 1;
  mise = 50;

  dice_result = 0;

  milestone=[];
  results = [6,7,8];

  points: any[] = new Array(10); // 10 points pour la timeline

  isStarted = false;
  isLoose = false;

  isConnected = true;
  showFooter=true;
  titre="";
  message="";
  showMessage=false;
  isFirstTime=false;

  private finals=[];
  private index=0;
  private decision=0;

  user:any={};
  game:any={};

  cube: HTMLElement;
  cube2: HTMLElement;

  constructor(
    public navCtrl: NavController,
    private util:UtilProvider,
    private api:ApiProvider,
    private auth:AuthProvider,
    private admob:AdmobProvider,
    private alertController:AlertController
  ) {
    this.finals= this.genererTableau(100);
    // Assurez-vous que l'élément cube est chargé après l'initialisation du composant
    setTimeout(() => {
      this.cube = document.getElementById('cube') as HTMLElement;
      this.cube2 = document.getElementById('cube2') as HTMLElement;
    }, 0);
  }

  ngOnInit() {
    this.admob.loadInterstitial();
    this.getGame();
    this.api.getSettings().then((d:any)=>{
      if(d){
        this.milestone = d.dice_points;
        this.milestone.push(this.game.jackpot - 24650);
      }
    })
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
  }

  ionViewWillLeave(){
    this.admob.showInterstitial();
  }


  startGame() {
    if(this.choix_decision=="" || this.choix_result==0){
      this.util.doToast('Vous n\'avez pas renseignez le nombre ou la décision',2000);
    } else {
      if(this.isLoose){
        this.level=1;
      }
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
              this.finals= this.genererTableau(100);
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
      if(this.choix_decision=='egal'){
        while(face+face2==this.choix_result){
          face = parseInt(this.util.randomInRange(6,1)+'');
          face2 = parseInt(this.util.randomInRange(6,1)+'');
        }
      } else if (this.choix_decision=='petit'){
        while(face+face2<this.choix_result){
          face = parseInt(this.util.randomInRange(6,1)+'');
          face2 = parseInt(this.util.randomInRange(6,1)+'');
        }
      } else if (this.choix_decision=='grand'){
        while(face+face2>this.choix_result){
          face = parseInt(this.util.randomInRange(6,1)+'');
          face2 = parseInt(this.util.randomInRange(6,1)+'');
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

    /*/ Animation du dé
    cube.style.transition = `transform ${duration}s cubic-bezier(0.52, -0.08, 0.56, 0.98)`;
    cube.style.transform = `rotateX(${x + spins * 360}deg) rotateY(${y + spins * 360}deg)`;

    // Animation du dé 2
    cube2.style.transition = `transform ${duration+0.5}s cubic-bezier(0.52, -0.08, 0.56, 0.98)`;
    cube2.style.transform = `rotateX(${f.x + (spins+1) * 360}deg) rotateY(${f.y + (spins+1) * 360}deg)`;

    // Réinitialiser la transformation après la durée
    setTimeout(() => {
      cube.style.transition = '';
      cube.style.transform = `rotateX(${x}deg) rotateY(${y}deg)`;

      cube2.style.transition = '';
      cube2.style.transform = `rotateX(${f.x}deg) rotateY(${f.y}deg)`;
      this.checkState();
    }, (duration+1) * 1000); // Correspond à la durée de l'animation
    */
    this.index++;
  }

  checkState(){
    if(this.choix_result==this.dice_result && this.choix_decision=='egal'){
      this.win_level();
    } else if(this.dice_result<this.choix_result && this.choix_decision=='petit'){
      this.win_level();
    } else if(this.dice_result>this.choix_result && this.choix_decision=='grand'){
      this.win_level();
    } else {
      this.loose();
    }
    this.showFooter=true;
  }

  async win_level(){
    this.showFooter=true;
    this.isStarted=false;
    this.level++;
    this.gain_tmp+=this.milestone[this.level-2];

    if(this.level>9){
      this.win(false);
    } else {
      const alert = await this.alertController.create({
        header: 'Vous avez gagné',
        message: 'Souhaitez-vous continuer om vous arreter et retirer vos gains?',
        buttons: [
          {
            text: 'Arreter',
            role: 'confirm',
            handler: () => {
              this.win(true);
            },
          },
          {
            text: 'Continuer',
            role: 'confirm',
            handler: () => {
            },
          }
        ],
      });
      await alert.present();
    }
  }

  async win(stopped:boolean){
    this.user.point = this.user.point+this.gain_tmp;
    const opt ={
      level:this.level,
      user_id:this.user.id,
      game_id:this.game.id,
      jackpot:this.gain_tmp,
      is_winner:true
    };

    this.api.post('scores',opt).then(d=>{
      this.titre = "VOUS AVEZ GAGNEZ !!!";
      this.message ="Vous avez gagnez "+this.gain_tmp+" W. Vos points ont été crédités sur votre compte";
      this.showMessage=true;
      this.showFooter=true;
      this.isLoose=false;
      this.isStarted=false;
      this.level=1;
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
    this.gain_tmp=0;
    //this.choix_result=0;
    //this.choix_decision="";
    this.level=1;
    this.ionViewWillEnter();
  }

  close(){
    this.admob.showInterstitial();
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
      name:'Dices'
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
