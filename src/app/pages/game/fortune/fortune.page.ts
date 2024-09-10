import {AfterViewInit, Component, OnInit} from '@angular/core';
import anime from 'animejs';
import {ApiProvider} from "../../../providers/api/api";
import {UtilProvider} from "../../../providers/util/util";
import {AlertController, NavController} from "@ionic/angular";
import {AdmobProvider} from "../../../providers/admob/AdmobProvider";
import {Network, NetworkStatus} from "@capacitor/network";

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
  private count = 50;
  isStarted=false;

  mise = 50;

  isConnected=true;
  showFooter=true;
  titre="";
  message="";
  showMessage=false;
  isFirstTime=true;

  win_p=[];
  lost_p=[];

  showLoading=true;
  is_katika=true;

  private prices = [];
  private percent = 0;

  result:any={};
  highlightedIndex: number | null = null; // Variable pour le segment en surbrillance

  private segmentCount = 30;

  // Créer segmentCount segments avec des couleurs différentes
  segments = [];

  constructor(
    private api:ApiProvider,
    private util:UtilProvider,
    public alertController:AlertController,
    public navCtrl:NavController,
    private admob:AdmobProvider
  ) {
      this.util.initializeNetworkListener();

  }

  ngOnInit() {
    this.admob.loadInterstitial();
    this.api.getSettings().then((d:any)=>{
      this.is_katika = d.katika == 'true';
      this.prices = d.game_settings.fortune.prices;
      this.percent = d.game_settings.fortune.percent;
      this.finals = this.genererTableau(this.count);

      for(let i=0; i<this.prices.length;i++){
        const x = parseInt(this.prices[i].split(' ')[0]);
        if(this.prices[i]!='0 W' && x>this.mise){
          this.win_p.push(
            {
              index:i,
              text: `${(i + 1)}`,
              prize: this.prices[i],
            }
          );
        } else if(this.prices[i]=='Jackpot'){
          this.win_p.push(
            {
              index:i,
              text: `${(i + 1)}`,
              prize: this.prices[i],
            }
          );
        } else {
          if(x>0){
            this.win_p.push(
              {
                index:i,
                text: `${(i + 1)}`,
                prize: this.prices[i],
              }
            );
          }
          this.lost_p.push(
            {
              index:i,
              text: `${(i + 1)}`,
              prize: this.prices[i],
            }
          );
        }
      }

      this.showLoading=false;

    });
  }

  ngAfterViewInit() {
    for(let i =0;i<this.segmentCount;i++){
      this.segments.push({
          text: i + 1,
          color: this.getSegmentColor(i),
          prize: this.getPrice(i),
        }
      )
    }
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
      this.mise = this.game.fees;
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
      is_winner:true
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
    this.showMessage=false;
    if(this.user.point==undefined || this.user.point<this.mise){
      this.util.doToast('Pas assez de W point pour commencer à jouer. Veuillez recharger votre compte',5000);
    } else {

      if(this.isConnected){
        // debit
        const opt ={
          user_id:this.user.id,
          game_id:this.game.id
        };
        this.api.post('start_game',opt).then(a=>{
          this.user.point-=this.mise;
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
        if(this.result.prize==undefined){
          this.result.prize=this.prices[this.result.text-1];
        }
        if(this.decision==0){
          const index = Math.floor(Math.random() * (this.lost_p.length ));
          this.result = this.lost_p[index];
          if(this.result.prize==undefined){
            this.result.prize=this.prices[this.result.text-1];
          }
          this.highlightedIndex = this.result.text-1;
        } else {
          if(this.result.prize=='Jackpot'){
            if(this.is_katika){
              this.win(this.game.jackpot+this.mise);
              this.is_katika=false;
            } else {
              const index = Math.floor(Math.random() * (this.lost_p.length ));
              this.result = this.lost_p[index];
              if(this.result.prize==undefined){
                this.result.prize=this.prices[this.result.text-1];
              }
              this.highlightedIndex = this.result.text-1;
              const price = parseInt(this.result.prize.split(' ')[0]);
              if(price!=0){
                this.win(price);
              }
            }
          } else {
            const price = parseInt(this.result.prize.split(' ')[0]);
            if(price!=0){
              this.win(price);
            }
          }
        }

        // Ré-afficher la roue avec le segment gagnant mis en surbrillance
        this.initializeWheel();
        this.highlightSegment();
        this.isStarted=false;
        this.showFooter=true;
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
    ctx.fillText(this.result.text, radius / 2 - 10, 0);
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
    return this.prices[index];
  }

  genererTableau(X: number): number[] {
    const tableau: number[] = [];

    const nbZeros = Math.floor(X * this.percent); // Calcul du nombre de 0 (70%)
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

