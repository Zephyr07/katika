import { Component, OnInit } from '@angular/core';
import {UtilProvider} from "../../../providers/util/util";
import {ApiProvider} from "../../../providers/api/api";
import {AlertController, NavController} from "@ionic/angular";
import {AdmobProvider} from "../../../providers/admob/AdmobProvider";
import * as _ from "lodash";

@Component({
  selector: 'app-apple',
  templateUrl: './apple.page.html',
  styleUrls: ['./apple.page.scss'],
})
export class ApplePage implements OnInit {
  private screenHeight: number = window.innerHeight;
  private countRow=10;
  private finals=[];
  private decision=0;
  rows=[];
  disposition=[];
  percent=0.7;
  hauteur=0;
  private header = 56;
  level=0;
  private table:any;
  user_choice:number;
  isLoose=false;
  isStarted=false;
  jackpot=0;

  user:any={};
  is_user = false;
  game:any={};

  gain_tmp = 0;
  private USCORE = 0;
  private uscore = 0;

  titre="";
  message="";
  showMessage=false;
  isFirstTime=true;

  isConnected=true;
  canPlay=true;
  showFooter=true;

  private isTournoi = false;

  constructor(
    private api:ApiProvider,
    private util:UtilProvider,
    public alertController:AlertController,
    public navCtrl:NavController,
    private admob:AdmobProvider
  ) {
    this.util.initializeNetworkListener();
    this.initializeGame(true);
  }

  ionViewWillEnter(){
    this.getGame();

    if(this.api.checkUser()){
      this.is_user=true;
      this.user=JSON.parse(localStorage.getItem('user_ka'));
      this.api.getList('auth/me',{id:this.user.id}).then((a:any)=>{
        this.user = a.data.user;
        localStorage.setItem('user_ka',JSON.stringify(this.user));
      },q=>{
        this.util.handleError(q);
      });
    } else {
      this.is_user=false;
    }
  }

  ionViewWillLeave(){
    this.admob.showInterstitial();
  }

  ngOnInit() {

    this.admob.loadInterstitial();
    this.hauteur = (this.screenHeight-this.header)*0.8;
    this.hauteur=this.hauteur/10; //10 lignes
    if(this.hauteur<50){
      this.hauteur=50;
    }
    window.addEventListener('resize', ()=>{
      this.screenHeight = window.innerHeight;
      this.hauteur = (this.screenHeight-this.header)*0.8;
      this.hauteur=this.hauteur/10; //10 lignes
      if(this.hauteur<50){
        this.hauteur=50;
      }
    });
  }

  startGame(reset_row:boolean){
    if(this.showMessage){
      this.showMessage=false;
    }

    if(this.user.point==undefined || this.user.point<50){
      this.util.doToast('Pas assez de W point pour commencer à jouer. Veuillez recharger votre compte',5000);
    } else {
      // debit
      const opt ={
        user_id:this.user.id,
        game_id:this.game.id
      };
      this.api.post('start_game',opt).then((a:any)=>{
        this.uscore=a;
        this.gain_tmp=0;
        this.isStarted=true;
        this.user.point-=50;
        this.showFooter=false;
        this.initializeGame(reset_row);
      },q=>{
        this.util.handleError(q);
      });
    }
  }

  close(){
    this.navCtrl.navigateRoot('/game');
  }

  getGame(){
    const opt={
      name:'Reapers'
    };
    this.api.getList('games',opt).then((d:any)=>{
      this.game=d[0];
      this.isTournoi = this.game.is_challenge;
      this.rows[0].gain = 3000+(this.game.jackpot-10000);
      this.jackpot = 3000+(this.game.jackpot-10000);
      if(this.isFirstTime){
        this.showRule();
        this.message = this.game.rule;
        this.isFirstTime=false;
      }
    },q=>{
      this.util.handleError(q);
    })
  }

  showRule(){
    this.titre=this.game.name;
    this.message=this.game.rule;
    this.showMessage=true;
  }

  initializeGame(reset_row:boolean) {
    this.level = 0;
    this.isLoose = false;
    
    if(reset_row){
      this.api.getSettings().then((d:any)=>{
        if(d){
          this.disposition = d.game_settings.repear.disposition;
          this.USCORE = d.USCORE;
          this.percent = d.game_settings.repear.percent;
          if(this.isTournoi){
            this.percent=0;
          }
          this.table = this.generateTable();
          this.finals = this.genererTableau(this.countRow);
          console.log(this.finals);
          const table = this.table;

          this.rows=[];

          for(let i=0;i<this.countRow;i++){
            this.rows.push(
              {
                id:i,
                gain:0,
                items:[
                  {
                    id:0,
                    row_id:i,
                    status:table[i][0]
                  },{
                    id:1,
                    row_id:i,
                    status:table[i][1]
                  },{
                    id:2,
                    row_id:i,
                    status:table[i][2]
                  },{
                    id:3,
                    row_id:i,
                    status:table[i][3]
                  },{
                    id:4,
                    row_id:i,
                    status:table[i][4]
                  }
                ]
              }
            )
          }

          this.rows[1].gain = d.game_settings.repear.points[0];
          this.rows[3].gain = d.game_settings.repear.points[1];
          this.rows[5].gain = d.game_settings.repear.points[2];
          this.rows[7].gain = d.game_settings.repear.points[3];
          this.rows[8].gain = d.game_settings.repear.points[4];
          this.rows[9].gain = this.jackpot;
          this.rows= this.rows.reverse();
          
        } else {
          alert("Setting absent");
        }
      },q=>{
        this.util.handleError(q);
      })
      

    }

  }

  updateDivDimensions() {
    this.screenHeight = window.innerHeight;
    this.hauteur = (this.screenHeight-this.header)*0.8;
    this.hauteur=this.hauteur/10; //10 lignes
    if(this.hauteur<50){
      this.hauteur=50;
    }
  }

  choice(item){
    if(this.isConnected){
      this.showMessage=false;
      if(this.isStarted && !this.isLoose){
        if(item.row_id==this.level){
          if(this.game.is_challenge){
            this.decision=1;
          } else {
            this.decision=this.finals[item.row_id];
            if(this.decision==1 && this.uscore>this.USCORE && !this.game.is_challenge){
              this.decision=0;
            }
          }

          if(item.status==0){
            // perdu
            this.loose();
          } else {
            if(this.decision==1){
              // gagné
              const row = _.find(this.rows,{id:item.row_id});
              this.gain_tmp+=row.gain;
              this.win_level();
            } else {
              // echec
              this.setRow(item.row_id,item.id);
            }
          }
          item.user_choice = true;
        }

      } else {
        let text = "JOUER";
        if(this.isLoose){
          text = "REJOUER";
        }
        this.util.doToast('Cliquer sur '+text+' pour commencer la partie',2000,'medium','middle')
      }
    } else {
      this.showMessage=true;
      this.titre="Vous n'êtes pas connecté";
      this.message="Connectez-vous à internet pour continuer à jouer"
    }

  }

  async win_level(){
    this.level++;
    if(this.level>9){
      this.win(false);
    } else {
      if((this.level+1)%2==1){
        const alert = await this.alertController.create({
          header: 'Continuer ou Arreter',
          subHeader:"Souhaitez-vous continuer?",
          message: 'Les points peuvent être retirer uniquement sur les paliers avec des gains',
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
      } else {
        this.util.doToast("vous avez gagnez le niveau",1000,'medium');
      }
    }
  }

  async loose(){
    this.titre = "Vous avez perdu";
    this.message ="Pas de chance, peut-être une prochaine fois 😭😭😭";
    this.showMessage=true;
    this.isLoose=true;
    this.level=10;
    this.showFooter=true;
    this.ionViewWillEnter();


    /*const alert = await this.alertController.create({
      header: 'VOUS AVEZ PERDU',
      message: 'Pas de chance, peut-être une prochaine fois',
      buttons: [
        {
          text: 'Fermer',
          role: 'confirm',
          handler: () => {
            this.isStarted=false;
          },
        },
        {
          text: 'Rejouer',
          role: 'confirm',
          handler: () => {
            this.ionViewWillEnter();
            this.startGame(true);
          },
        }
      ],
    });

    await alert.present();*/
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
      this.ionViewWillEnter();
    },q=>{
      this.util.handleError(q);
    });
  }

  closeMessage(event: string){
    this.showMessage=false;
    if(!this.isStarted||this.isLoose){
    }
  }

  generateTable(): number[][] {
    const table: number[][] = [];

    for (let i = 0; i < 10; i++) {
      // Create an array with 3 zeros and 2 ones
      let row: number[] = this.disposition;

      // Shuffle the array to randomize the order
      row = row.sort(() => Math.random() - 0.5);

      // Push the shuffled row to the table
      table.push(row);
    }

    return table;
  }

  genererTableau(X: number): number[] {
    const tableau: number[] = [];

    const nbZeros = Math.floor(X * this.percent); // Calcul du nombre de 0 (40%)
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

    tableau[0]=1;
    tableau[2]=1;
    tableau[4]=1;
    tableau[6]=1;

    return tableau;
  }
  
  setRow(row_id:number,id:number){
    let row = _.find(this.rows,{id:row_id});
    this.rows=this.rows.reverse();
    const index = this.rows.indexOf(row);
    const gain = row.gain;

    if(id==0){
      this.rows[index] = {
        id:index,
        gain,
        items:[
          {
            id:0,
            row_id:index,
            status:0,
            user_choice:true
          },
          {
            id:1,
            row_id:index,
            status:1,
            user_choice:false
          },
          {
            id:2,
            row_id:index,
            status:1,
            user_choice:false
          },
          {
            id:3,
            row_id:index,
            status:0,
            user_choice:false
          },
          {
            id:4,
            row_id:index,
            status:0,
            user_choice:false
          }
        ]
      }
    } else if(id==4){
      this.rows[index] = {
        id:index,
        gain,
        items:[
          {
            id:0,
            row_id:index,
            status:0,
            user_choice:false
          },
          {
            id:1,
            row_id:index,
            status:1,
            user_choice:false
          },
          {
            id:2,
            row_id:index,
            status:0,
            user_choice:false
          },
          {
            id:3,
            row_id:index,
            status:1,
            user_choice:false
          },
          {
            id:4,
            row_id:index,
            status:0,
            user_choice:true
          }
        ]
      }
    } else if (id==1){
      this.rows[index] = {
        id:index,
        gain,
        items:[
          {
            id:0,
            row_id:index,
            status:1,
            user_choice:false
          },
          {
            id:1,
            row_id:index,
            status:0,
            user_choice:true
          },
          {
            id:2,
            row_id:index,
            status:1,
            user_choice:false
          },
          {
            id:3,
            row_id:index,
            status:0,
            user_choice:false
          },
          {
            id:4,
            row_id:index,
            status:0,
            user_choice:false
          }
        ]
      }
    } else if (id==2){
      this.rows[index] = {
        id:index,
        gain,
        items:[
          {
            id:0,
            row_id:index,
            status:0,
            user_choice:false
          },
          {
            id:1,
            row_id:index,
            status:1,
            user_choice:false
          },
          {
            id:2,
            row_id:index,
            status:0,
            user_choice:true
          },
          {
            id:3,
            row_id:index,
            status:0,
            user_choice:false
          },
          {
            id:4,
            row_id:index,
            status:1,
            user_choice:false
          }
        ]
      }
    } else if (id==3){
      this.rows[index] = {
        id:index,
        gain,
        items:[
          {
            id:0,
            row_id:index,
            status:1,
            user_choice:false
          },
          {
            id:1,
            row_id:index,
            status:1,
            user_choice:false
          },
          {
            id:2,
            row_id:index,
            status:0,
            user_choice:false
          },
          {
            id:3,
            row_id:index,
            status:0,
            user_choice:true
          },
          {
            id:4,
            row_id:index,
            status:0,
            user_choice:false
          }
        ]
      }
    }
    this.rows=this.rows.reverse();
    this.loose();
  }
}
