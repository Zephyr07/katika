import {AfterViewInit, Component, OnInit} from '@angular/core';
import anime from 'animejs';
import {ApiProvider} from "../../../providers/api/api";
import {UtilProvider} from "../../../providers/util/util";
import {AlertController, NavController} from "@ionic/angular";
import {AdmobProvider} from "../../../providers/admob/AdmobProvider";

@Component({
  selector: 'app-fortune',
  templateUrl: './fortune.page.html',
  styleUrls: ['./fortune.page.scss'],
})
export class FortunePage implements OnInit,AfterViewInit {

  user:any={};
  is_user = false;
  game:any={};

  private indexDec=0;
  private decision=0;

  private finals=[];
  private count = 5;
  isStarted=false;

  win_p=[];
  lost_p=[];

  private prices = [
    '0 W',
    '100 W',
    '30 W',
    '0 W',
    '0 W',
    '0 W',
    'Jackpot',
    '0 W',
    '0 W',
    '0 W',
    '0 W',
    '0 W',
    '0 W',
    '0 W',
    '0 W',
    '0 W',
    '0 W',
    '10 W',
    '0 W',
    '50 W',
    '1000 W',
    '0 W',
    '0 W',
    '25 W',
    '40 W',
    '35 W',
    '200 W',
    '500 W',
    '0 W',
    '0 W'
  ];

  result:any={};
  highlightedIndex: number | null = null; // Variable pour le segment en surbrillance

  private segmentCount = 30;

  // Créer segmentCount segments avec des couleurs différentes
  segments = Array.from({ length: this.segmentCount }, (_, i) => ({
    text: `${(i + 1)}`,
    color: this.getSegmentColor(i),
    prize: this.getPrice(i),
  }));

  constructor(
    private api:ApiProvider,
    private util:UtilProvider,
    public alertController:AlertController,
    public navCtrl:NavController,
    private admob:AdmobProvider
  ) {
    this.finals = this.genererTableau(this.count);
  }

  ngOnInit() {
    this.admob.loadInterstitial();
    for(let i=0; i<this.prices.length;i++){
      if(this.prices[i]!='0 W'){
        this.win_p.push(
          {
            index:i,
            text: `${(i + 1)}`,
            prize: this.prices[i],
          }
        );
      } else {
        this.lost_p.push(
          {
            index:i,
            text: `${(i + 1)}`,
            prize: this.prices[i],
          }
        );
      }
    }
  }

  ngAfterViewInit() {
    this.initializeWheel();
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

  close(){
    this.admob.showInterstitial();
    this.navCtrl.navigateRoot('/game');
  }

  getGame(){
    const opt={
      name:'Roue du Bonheur'
    };
    this.api.getList('games',opt).then((d:any)=>{
      this.game=d[0];
    })
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

  async win(jackpot){
    const opt ={
      level:10,
      user_id:this.user.id,
      game_id:this.game.id,
      jackpot,
      is_winner:true
    };

    this.api.post('scores',opt).then(d=>{
      this.ionViewWillEnter();
    });
    //this.util.doToast("Felicitations, vous avez gagnez "+jackpot+" W",3000);
  }

  async loose(){
    // enregistrement du stocke
    const opt ={
      level:1,
      user_id:this.user.id,
      game_id:this.game.id,
      jackpot:0,
      is_winner:false
    };
    this.game.jackpot+=50;

    this.api.post('scores',opt).then(d=>{

    });
    const alert = await this.alertController.create({
      header: 'VOUS AVEZ PERDU',
      message: 'Vous n\'avez pas reussi à trouver les 5 cristaux',
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

  startGame(){
    this.isStarted=true;
    if(this.user.point<50){
      this.util.doToast('Pas assez de W point pour commencer à jouer. Veuillez recharger votre compte',5000);
    } else {
      // debit
      const opt ={
        user_id:this.user.id,
        game_id:this.game.id
      };
      this.api.post('start_game',opt).then(a=>{
        this.user.point-=50;
        this.spinWheel();
      });
    }
  }

  initializeWheel() {
    const canvas = document.getElementById('wheel') as HTMLCanvasElement;
    if (!canvas) {
      console.error('Canvas element not found');
      return;
    }
    const ctx = canvas.getContext('2d')!;
    const radius = canvas.width / 2;
    const segmentAngle = (2 * Math.PI) / this.segmentCount;

    canvas.width = 300;
    canvas.height = 300;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(radius, radius);

    // Dessiner chaque segment avec couleur unique
    for (let i = 0; i < this.segmentCount; i++) {
      const angle = segmentAngle * i;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, angle, angle + segmentAngle);
      ctx.lineTo(0, 0);
      ctx.fillStyle = this.segments[i].color;
      ctx.fill();
      ctx.stroke();

      // Dessiner le texte dans chaque segment
      ctx.save();
      ctx.rotate(angle + segmentAngle / 2);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      if(i%2==0){
        ctx.fillStyle = '#fff';
      } else {
        ctx.fillStyle = '#000';
      }
      ctx.font = '14px Arial';
      ctx.fillText(this.segments[i].text, radius / 2 - 10, 0);
      ctx.restore();
    }

    ctx.translate(-radius, -radius); // Réinitialiser la translation
  }

  spinWheel() {
    const canvas = document.getElementById('wheel') as HTMLCanvasElement;
    if (!canvas) {
      console.error('Canvas element not found');
      return;
    }

    const segmentCount = this.segments.length;
    const segmentAngle = 360 / segmentCount;
    const randomSegmentIndex = Math.floor(Math.random() * segmentCount);
    const angle = segmentAngle * randomSegmentIndex;
    const threeTurns = 360 * 3; // Trois tours complets
    const additionalTurns = 360 * (Math.floor(Math.random() * 5) + 3); // 3 à 7 tours supplémentaires
    const totalRotation = angle + threeTurns + additionalTurns; // Inclure trois tours et des tours supplémentaires

    // Réinitialiser la surbrillance
    this.highlightedIndex = null;

    // Animation de la roue
    anime({
      targets: canvas,
      rotate: {
        value: totalRotation,
        duration: 3000,
        easing: 'easeOutQuint',
      },
      update: (anim) => {
        const ctx = canvas.getContext('2d')!;
        const radius = canvas.width / 2;
        const currentRotation = (anim.currentTime / anim.duration) * totalRotation;
        const currentAngle = currentRotation % 360;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.translate(radius, radius);

        // Dessiner chaque segment avec ou sans surbrillance
        for (let i = 0; i < segmentCount; i++) {
          const angle = segmentAngle * i;
          const endAngle = angle + segmentAngle;

          // Si le segment est celui en surbrillance après l'arrêt, on modifie sa couleur en violet
          if (i === this.highlightedIndex) {
            ctx.fillStyle = '#fff'; // Violet pour le segment sélectionné
          } else {
            ctx.fillStyle = this.segments[i].color; // Couleur normale
          }

          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.arc(0, 0, radius, angle * Math.PI / 180, endAngle * Math.PI / 180);
          ctx.lineTo(0, 0);
          ctx.fill();
          ctx.stroke();

          /*/ Dessiner le texte dans chaque segment
          ctx.save();
          ctx.rotate(angle + segmentAngle / 2);
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#000';
          ctx.font = '14px Arial';
          ctx.fillText(this.segments[i].text, radius / 2 - 10, 0);
          ctx.restore();*/
        }

        ctx.translate(-radius, -radius); // Réinitialiser la translation
      },
      complete: () => {
        // Calculer l'index du segment qui s'arrête sous le curseur (en haut)
        const finalAngle = totalRotation % 360;
        const selectedIndex = Math.floor(finalAngle / segmentAngle);
        this.highlightedIndex = selectedIndex; // Surbrillance du segment sélectionné

        // decision
        this.decision=this.finals[this.indexDec];
        this.indexDec=(this.indexDec+1)%this.finals.length;
        this.result = this.segments[selectedIndex];

        if(this.result.prize!='Jackpot'){
          const price = parseInt(this.result.prize.split(' ')[0]);
          if(price!=0){
            if(this.decision==0){
              // attribution d'un autre segment
              const index = Math.floor(Math.random() * (this.lost_p.length + 1));
              this.result = this.segments[index];
            } else {
              this.win(price);
            }
          }
        } else {
          if(this.decision==0){
            // attribution d'un autre segment
            const index = Math.floor(Math.random() * (this.lost_p.length + 1));
            this.result = this.segments[index];
          } else {
            this.win(this.game.jackpot+50);
          }
        }

        // Ré-afficher la roue avec le segment gagnant mis en surbrillance
        this.initializeWheel();
        this.highlightSegment();
        this.isStarted=false;
        this.getGame();
      },
    });
  }

  highlightSegment() {
    const canvas = document.getElementById('wheel') as HTMLCanvasElement;
    if (!canvas || this.highlightedIndex === null) {
      return;
    }

    const ctx = canvas.getContext('2d')!;
    const radius = canvas.width / 2;
    const segmentAngle = (2 * Math.PI) / this.segmentCount;

    // Dessiner le segment sélectionné avec une surbrillance violette
    const startAngle = segmentAngle * this.highlightedIndex;
    const endAngle = startAngle + segmentAngle;
    ctx.save();
    ctx.translate(radius, radius);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, startAngle, endAngle);
    ctx.lineTo(0, 0);
    ctx.fillStyle = '#fff'; // Violet pour la surbrillance
    ctx.fill();
    ctx.stroke();

    // Dessiner le texte dans le segment en surbrillance
    ctx.save();
    ctx.rotate(startAngle + segmentAngle / 2);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#000';
    ctx.font = '14px Arial';
    ctx.fillText(this.segments[this.highlightedIndex].text, radius / 2 - 10, 0);
    ctx.restore();

    ctx.restore(); // Réinitialiser le contexte
  }

  // Fonction pour attribuer des couleurs uniques à chaque segment
  private getSegmentColor(index: number): string {
    const colors = ['#FFDDC1', '#FFABAB', '#FFC3A0', '#FF677D', '#D4A5A5', '#A4C3B2', '#FF6B6B', '#6B4226', '#C9D6DF', '#F1C6B8'];
    if(index%2==0){
      return '#d219ec';
    } else {
      return '#f9be3a'
    }

    //return colors[index % colors.length];
  }

  // Fonction pour attribuer des couleurs uniques à chaque segment
  private getPrice(index: number): string {
    return this.prices[index % this.prices.length];
  }

  genererTableau(X: number): number[] {
    const tableau: number[] = [];

    const nbZeros = Math.floor(X * 0.7); // Calcul du nombre de 0 (70%)
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

