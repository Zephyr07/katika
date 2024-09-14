import {AfterViewInit, Component, OnInit} from '@angular/core';
import * as _ from "lodash";
import {UtilProvider} from "../../../providers/util/util";
import {ApiProvider} from "../../../providers/api/api";
import {AlertController, NavController} from "@ionic/angular";
import {AdmobProvider} from "../../../providers/admob/AdmobProvider";

@Component({
  selector: 'app-jewel',
  templateUrl: './jewel.page.html',
  styleUrls: ['./jewel.page.scss'],
})
export class JewelPage implements OnInit, AfterViewInit {

  items:any = [];
  mouvementLeft=0;
  private mouvement=50;
  private touchStartX: number | null = null;
  private touchStartY: number | null = null;
  score=0;
  private itemCount=64;
  private startIndex=-1;
  private endIndex=-1;

  showLoading=true;

  private recursion=0;
  board:any={
    index:-1,
    scores:[]
  };
  mise=0;
  jackpot=0;

  my_score:any={};

  titre="";
  message="";
  showMessage=false;
  private isFirstTime=true;
  showFooter=true;
  user:any={};
  is_user = false;
  game:any={};
  isLoose=false;
  isStarted=false;

  private values=[];
  private valuess = [
    {
      point:1,
      name:'RED',
      percent:15
    },
    {
      point:1,
      name:'GREEN',
      percent:15
    },
    {
      point:1,
      name:'BLUE',
      percent:15
    },
    {
      point:2,
      name:'WHITE',
      percent:10
    },
    {
      point:2,
      name:'PINK',
      percent:10
    },
    {
      point:2,
      name:'YELLOW',
      percent:10
    },
    {
      point:3,
      name:'PURPLE',
      percent:6
    },
    {
      point:3,
      name:'BROWN',
      percent:6
    },
    {
      point:3,
      name:'ORANGE',
      percent:6
    },
    {
      point:5,
      name:'CYAN',
      percent:2
    }
  ];
  draggedItemIndex: number | null = null;
  touchedItemIndex: number | null = null;
  gridColumns = 8; // 8 colonnes dans la grille
  positions: Array<number[]> = []; // Variable pour stocker les indices des éléments alignés

  alignedItemCount: number = 0; // Compteur pour les éléments alignés


  // Associer chaque lettre à une image
  imageMap: { [key: string]: string } = {
    'RED': 'assets/img/jewel/red.png',
    'GREEN': 'assets/img/jewel/green.png',
    'BLUE': 'assets/img/jewel/blue.png',
    'WHITE': 'assets/img/jewel/white.png',
    'PINK': 'assets/img/jewel/pink.png',
    'YELLOW': 'assets/img/jewel/yellow.png',
    'PURPLE': 'assets/img/jewel/purple.png',
    'BROWN': 'assets/img/jewel/brown.png',
    'ORANGE': 'assets/img/jewel/orange.png',
    'CYAN': 'assets/img/jewel/diamond.png',
    'STAR': 'assets/img/jewel/star.png',
    'TRIANGLE': 'assets/img/jewel/triangle.png',
  };

  points=[];

  constructor(
    private api:ApiProvider,
    private util:UtilProvider,
    public alertController:AlertController,
    public navCtrl:NavController,
    private admob:AdmobProvider
  ) {
    this.showLoading=true;
  }

  ngOnInit() {

  }

  ionViewWillEnter(){
    if(this.isFirstTime){
      this.api.getSettings().then((d:any)=>{
        this.values = d.game_settings.jewel.values;
        this.mouvement = d.game_settings.jewel.mouvement;
        this.mouvementLeft = this.mouvement;
        this.jackpot = d.game_settings.jewel.jackpot;

        this.items = this.getRandomItems(this.values,this.itemCount);
        this.showLoading=false;
        let g = _.groupBy(this.values,'point');
        let col=[];
        for(let i in g){
          let items=[];
          g[i].forEach(v=>{
            items.push({
              name:v.name,
              percent:v.percent,
              image:this.getImageForItem(v)
            });
          });
          col.push({
            point:i,
            items:items
          });
        }
        this.points= col;

      },q=>{
        this.showLoading=false;
        this.util.handleError(q);
      })
    } else {

    }

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

  ngAfterViewInit(){

  }

  getRandomElements(arr: any[]): string[] {
    const randomIndex = Math.floor(Math.random() * arr.length); // Sélectionner un indice aléatoire
    return arr[randomIndex];
  }

  getRandomItems(arr: any[], numElements: number): string[] {
    const result: string[] = [];

    // Créer un tableau étendu basé sur les pourcentages
    const extendedArray: string[] = [];

    arr.forEach((el:any) => {
      const count = Math.floor((el.percent / 100) * numElements);
      for (let i = 0; i < count; i++) {
        extendedArray.push(el);
      }
    });

    // Remplir le tableau jusqu'à la taille 'x'
    while (result.length < numElements) {
      // Choisir un élément aléatoire du tableau étendu
      const randomIndex = Math.floor(Math.random() * extendedArray.length);
      result.push(extendedArray[randomIndex]);
    }

    return result;
  }

  // Méthode pour obtenir l'image associée à chaque élément
  getImageForItem(item: any): string {
    return this.imageMap[item.name];
  }

  // Desktop Drag Start
  onDragStart(event: DragEvent, index: number) {
    if(this.isStarted){
      //console.log('onDragStart',index);
      this.draggedItemIndex = index;
      const target = event.target as HTMLElement;
      target.classList.add('dragging');
      event.dataTransfer?.setData('text/plain', index.toString());
      event.dataTransfer!.effectAllowed = "move";
    } else {
      this.util.doToast('Cliquer sur Jouer pour commencer la partie',2000,'light');
    }

  }

  // Desktop Drag Over
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.dataTransfer!.dropEffect = "move";
    //console.log('onDragOver');
  }

  // Desktop Drop
  onDrop(event: DragEvent, dropIndex: number) {
    event.preventDefault();
    const draggedIndex = this.draggedItemIndex;

    //console.log('onDragOver',draggedIndex,dropIndex);

    const target = event.target as HTMLElement;
    target.classList.remove('dragging');

    if (draggedIndex === null || draggedIndex === dropIndex) {
      return;
    }
    if (this.isValidDrag(draggedIndex, dropIndex)) {
      this.startIndex = draggedIndex;
      this.endIndex = dropIndex;
      this.swapItemsAndVerification();
    } else {
      //console.log("azeaze");
    }
  }

  swapItemsAndVerification(){
    if(this.mouvementLeft>0){
      this.swapItems(this.startIndex,this.endIndex);
      this.mouvementLeft--;
      this.isMouvement(true);
      if(this.mouvementLeft==0){
        this.endGame();
      }
    } else {

    }
  }

  refreshGrid(){
    this.items = this.shuffleArray(this.items);
    document.getElementById('grille').classList.add('scale-in-center');
  }

  shuffleArray(array) {
    const shuffledArray = [...array]; // Créer une copie du tableau pour éviter de modifier l'original
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); // Index aléatoire
      // Échange des éléments
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray; // Retourner le tableau mélangé
  }

  isMouvement(isChange:boolean){
    const mouv = this.getAllValideNextPositions();
    //console.log(mouv);
    if(mouv[0].length==0 && mouv[1].length==0){
      setTimeout(()=>{
        this.refreshGrid();
        setTimeout(()=>{
          this.util.doToast('Actualisation de la grille',1000,'light');
          this.getAllValidePositions();
        },300);
      },700);
      //this.mouvementLeft=0;
      //this.endGame();
    } else {
      if(isChange){
        this.positions = mouv[1];
        this.changeItem();
      } else {
        this.getAllValidePositions();
      }
    }
  }

  getGridCarre(index){
    const ligne = Math.trunc(index/8);
    const colonne = index%8;
    // recuperation des elements autour de startindex
    let g1 = -1;
    let g2 = -1;
    let g3 = -1;
    let d1 = -1;
    let d2 = -1;
    let d3 = -1;
    let h1 = -1;
    let h2 = -1;
    let h3 = -1;
    let b1 = -1;
    let b2 = -1;
    let b3 = -1;
    let gh11 = -1;
    let gh12 = -1;
    let gh21 = -1;
    let gb11 = -1;
    let gb12 = -1;
    let gb21 = -1;
    let dh11 = -1;
    let dh12 = -1;
    let dh21 = -1;
    let db11 = -1;
    let db12 = -1;
    let db21 = -1;

    let ish1 = false;
    let ish2 = false;
    let isb1 = false;
    let isb2 = false;
    if(ligne>0){
      ish1=true;
      h1=index-8;
      if(ligne>1){
        ish2 = true;
        h2=index-16;
      }
      if(ligne>2){
        h3=index-24;
      }
    }
    if(ligne<7){
      isb1 = true;
      b1=index+8;
      if(ligne<6){
        b2=index+16;
        isb2 = true;
      }
      if(ligne<5){
        b3=index+24;
      }
    }

    let name = this.items[index].name;

    if(colonne>=0 && colonne<8){
      if(colonne==0){
        // pas de gauche 1 ni 2
      } else if(colonne>0){
        // gauche 1
        g1=index-1;
        if(isb1){
          gb11 = g1+8
        }
        if(isb2){
          gb12 = g1+16
        }
        if(ish1){
          gh11 = g1-8;
        }
        if(ish2){
          gh12 = g1-16;
        }
        if(colonne>1){
          // gauche 2
          g2=index-2;
          if(isb1){
            gb21= g2+8
          }
          if(ish1){
            gh21= g2-8
          }
        }
        if(colonne>2){
          // gauche 3
          g3=index-3;
        }
      }

      if(colonne==7){
        // pas de droite 1 pas de droite 2
      } else if(colonne<7){
        // droite 1
        d1=index+1;
        if(isb1){
          db11 = d1+8
        }
        if(isb2){
          db12 = d1+16
        }
        if(ish1){
          dh11 = d1-8;
        }
        if(ish2){
          dh12 = d1-16;
        }

        if(colonne<6){
          // droite 2
          d2=index+2;
          if(isb1){
            db21= d2+8
          }
          if(ish1){
            dh21= d2-8
          }
        }
        if(colonne<5){
          // droite 2
          d3=index+3;
        }
      }

    }

    let nb1 = this.getItemName(b1);
    let nb2 = this.getItemName(b2);
    let nb3 = this.getItemName(b3);
    let nd1 = this.getItemName(d1);
    let nd2 = this.getItemName(d2);
    let nd3 = this.getItemName(d3);
    let nh1 = this.getItemName(h1);
    let nh2 = this.getItemName(h2);
    let nh3 = this.getItemName(h3);
    let ng1 = this.getItemName(g1);
    let ng2 = this.getItemName(g2);
    let ng3 = this.getItemName(g3);
    let ngh11 = this.getItemName(gh11);
    let ngh12 = this.getItemName(gh12);
    let ngh21 = this.getItemName(gh21);
    let ndh11 = this.getItemName(dh11);
    let ndh12 = this.getItemName(dh12);
    let ndh21 = this.getItemName(dh21);
    let ngb11 = this.getItemName(gb11);
    let ngb12 = this.getItemName(gb12);
    let ngb21 = this.getItemName(gb21);
    let ndb11 = this.getItemName(db11);
    let ndb12 = this.getItemName(db12);
    let ndb21 = this.getItemName(db21);


    return [[
      '','','',nh3,'','','',
      '','',ngh12,nh2,ndh12,'','',
      '',ngh21,ngh11,nh1,ndh11,ndh21,'',
      ng3,ng2,ng1,name,nd1,nd2,nd3,
      '',ngb21,ngb11,nb1,ndb11,ndb21,'',
      '','',ngb12,nb2,ndb12,'','',
      '','','',nb3,'','','',
    ],
    [
      '','','',h3,'','','',
      '','',gh12,h2,dh12,'','',
      '',gh21,gh11,h1,dh11,dh21,'',
      g3,g2,g1,index,d1,d2,d3,
      '',gb21,gb11,b1,db11,db21,'',
      '','',gb12,b2,db12,'','',
      '','','',b3,'','','',
    ]
    ]
  }


  getGridCroix(index){
    // recuperation des elements autour de startindex
    let g1 = -1;
    let g2 = -1;
    let d1 = -1;
    let d2 = -1;
    let h1 = -1;
    let h2 = -1;
    let b1 = -1;
    let b2 = -1;

    let name = this.items[index].name;

    const colonne=index%8;

    //gauche
    if(colonne!=0){
      g1=index-1;
      if(index!=1){
        g2=index-2;
      }
    } else {
      d1=index+1;
      d2=index+2;
    }

    //droit
    if(index!=7){
      d1=index+1;
      if(index!=6){
        d2=index+2;
      }
    } else {
      g1=index-1;
      g2=index-2;
    }

    //haut
    if(index>7){
      h1=index-8;
      if(index>15){
        h2=index-16;
      }
    } else {
      b1=index+8;
      b2=index+16;
    }

    //bas
    if(index<56){
      b1=index+8;
      if(index<48){
        b2=index+16;
      }
    } else {
      h1=index-8;
      h2=index-16;
    }

    let nb1 = this.getItemName(b1);
    let nb2 = this.getItemName(b2);
    let nd1 = this.getItemName(d1);
    let nd2 = this.getItemName(d2);
    let nh1 = this.getItemName(h1);
    let nh2 = this.getItemName(h2);
    let ng1 = this.getItemName(g1);
    let ng2 = this.getItemName(g2);

    return [[
      '','',nh2,'','',
      '','',nh1,'','',
      ng2,ng1,name,nd1,nd2,
      '','',nb1,'','',
      '','',nb2,'',''
    ],
      [
        '','',h2,'','',
        '','',h1,'','',
        g2,g1,index,d1,d2,
        '','',b1,'','',
        '','',b2,'',''
      ]
    ]
  }

  getItemName(index){
    if(this.items[index]!=undefined){
      return this.items[index].name;
    } else {
      return '';
    }
  }

  getValidePosition(grid: string[], target: string): number[][] {
    let position = [];
    //vertical
    if(grid[2]===target && grid[7]===target){
      position.push([2,7,12]);
    }
    if(grid[17]==target && grid[7]==target){
      position.push([17,7,12]);
    }
    if(grid[17]==target && grid[2]==target && grid[7]==target){
      position.push([17,7,12,2]);
    }

    if(grid[22]===target && grid[17]===target){
      position.push([22,17,12]);
    }
    if(grid[17]==target && grid[7]==target && grid[22]==target){
      position.push([22,17,12,7]);
    }

    if(grid[2]===target && grid[22]===target && grid[7]===target && grid[17]===target){
      position.push([22,17,7,2,12]);
    }

    // horizontal
    if(grid[10]==target && grid[11]==target){
      position.push([10,11,12]);
    }
    if(grid[13]==target && grid[11]==target){
      position.push([11,13,12]);
    }
    if(grid[14]==target && grid[13]==target){
      position.push([14,13,12]);
    }
    if(grid[10]==target && grid[11]==target && grid[13]==target){
      position.push([11,10,13,12]);
    }
    if(grid[11]==target && grid[14]==target && grid[13]==target){
      position.push([11,14,13,12]);
    }
    if(grid[10]==target &&grid[11]==target && grid[13]==target && grid[14]==target){
      position.push([10,11,13,14,12]);
    }

    return position;
  }

  getAllValidePositions(){
    let allPositions=[];
    for(let i=0;i<64;i++){
      const grid = this.getGridCroix(i);
      let positions = this.getValidePosition(grid[0],this.items[i].name);
      if(positions.length>0){
        positions.forEach(pos=>{
          let po =[];
          pos.forEach(v=>{
            po.push(grid[1][v]);
          });
          allPositions.push(po);
        });
      }
    }
    if(allPositions.length>0){
      const flatArray = allPositions.flat();

      // Utiliser Set pour avoir des valeurs uniques
      const uniqueArray = Array.from(new Set(flatArray));

      // Optionnel : trier le tableau si l'ordre est important
      uniqueArray.sort(); // Cela donnera ['a', 'b', 'c']

      // Mettre le tableau dans une structure 2D
      let r = [uniqueArray];
      this.positions = r;

      if(r.length>0){
        if(this.recursion<5){
          this.changeItem();
          this.recursion++;
        } else {
          this.recursion=0;
        }
      }
    }

  }

  getAllValideNextPositions(){
    let allNextPositions=[];
    for(let i=0;i<64;i++){
      const grid = this.getGridCarre(i);
      const positions = this.getValideNextPosition(grid[0],this.items[i].name);
      let is_null = false;
      positions.forEach(pos=>{
        let po =[];
        pos.forEach(v=>{
          if(grid[1][v]==-1){
            is_null=true;
          }
          po.push(grid[1][v]);
        });
        if(!is_null){
          allNextPositions.push(po);
        } else {
          is_null=false;
        }
      });
    }

    // possition possible actuellement
    let allPositions=[];
    for(let i=0;i<64;i++){
      const grid = this.getGridCroix(i);
      const positions = this.getValidePosition(grid[0],this.items[i].name);
      positions.forEach(pos=>{
        let po =[];
        pos.forEach(v=>{
          po.push(grid[1][v]);
        });
        allPositions.push(po);
      });
    }

    if(allNextPositions.length>0){
      const flatArray = allNextPositions.flat();

      // Utiliser Set pour avoir des valeurs uniques
      const uniqueArray = Array.from(new Set(flatArray));

      // Optionnel : trier le tableau si l'ordre est important
      uniqueArray.sort(); // Cela donnera ['a', 'b', 'c']

      // Mettre le tableau dans une structure 2D
      let r = [uniqueArray];
      allNextPositions = r;

    }

    if(allPositions.length>0){
      const flatArray = allPositions.flat();

      // Utiliser Set pour avoir des valeurs uniques
      const uniqueArray = Array.from(new Set(flatArray));

      // Optionnel : trier le tableau si l'ordre est important
      uniqueArray.sort(); // Cela donnera ['a', 'b', 'c']

      // Mettre le tableau dans une structure 2D
      let r = [uniqueArray];
      allPositions = r;

    }

    return [allNextPositions,allPositions];
  }

  getValideNextPosition(grid: string[], target: string): number[][] {
    let position = [];
    // haut
    if(grid[10]=== target){
      if(grid[16]===target){
        position.push([10,16,24]);
      }
      if(grid[18]===target){
        position.push([10,18,24]);
      }
    }
    if(grid[17]=== target){
      if(grid[9]===target){
        position.push([17,9,24]);
      }
      if(grid[11]===target){
        position.push([11,17,24]);
      }
    }

    if(grid[3]==target && grid[10]==target){
      position.push([3,10,24]);
      if(grid[16]==target){
        position.push([3,10,16,24]);
      }
      if(grid[18]==target){
        position.push([3,10,18,24]);
      }
    }
    if(grid[3]==target && grid[17]==target){
      position.push([3,17,24]);
      if(grid[9]==target){
        position.push([3,17,9,24]);
      }
      if(grid[11]==target){
        position.push([3,17,11,24]);
      }
    }

    // droit
    if(grid[26]=== target){
      if(grid[32]===target){
        position.push([32,26,24]);
      }
      if(grid[18]===target){
        position.push([26,18,24]);
      }
    }
    if(grid[25]=== target){
      if(grid[19]===target){
        position.push([25,19,24]);
      }
      if(grid[33]===target){
        position.push([33,25,24]);
      }
    }


    if(grid[25]==target && grid[27]==target){
      position.push([25,27,24]);
      if(grid[19]==target){
        position.push([25,27,19,24]);
      }
      if(grid[33]==target){
        position.push([25,127,33,24]);
      }
    }
    if(grid[26]==target && grid[27]==target){
      position.push([26,27,24]);
      if(grid[18]==target){
        position.push([26,27,18,24]);
      }
      if(grid[32]==target){
        position.push([26,27,32,24]);
      }
    }

    //gauche
    if(grid[23]=== target){
      if(grid[15]===target){
        position.push([23,15,24]);
      }
      if(grid[29]===target){
        position.push([23,29,24]);
      }
    }
    if(grid[22]=== target){
      if(grid[16]===target){
        position.push([22,16,24]);
      }
      if(grid[30]===target){
        position.push([22,30,24]);
      }
    }

    if(grid[21]==target && grid[22]==target){
      position.push([21,22,24]);
      if(grid[16]==target){
        position.push([16,21,22,24]);
      }
      if(grid[30]==target){
        position.push([30,21,22,24]);
      }
    }

    if(grid[21]==target && grid[23]==target){
      position.push([21,23,24]);
      if(grid[15]==target){
        position.push([15,21,23,24]);
      }
      if(grid[29]==target){
        position.push([29,21,23,24]);
      }
    }

    // bas
    if(grid[31]=== target){
      if(grid[37]===target){
        position.push([31,37,24]);
      }
      if(grid[39]===target){
        position.push([31,39,24]);
      }
    }
    if(grid[38]=== target){
      if(grid[30]===target){
        position.push([30,38,24]);
      }
      if(grid[32]===target){
        position.push([38,32,24]);
      }
    }

    if(grid[31]==target && grid[45]==target){
      position.push([31,45,24]);
      if(grid[37]==target){
        position.push([37,31,45,24]);
      }
      if(grid[39]==target){
        position.push([39,31,45,24]);
      }
    }

    if(grid[38]==target && grid[45]==target){
      position.push([38,45,24]);
      if(grid[30]==target){
        position.push([30,38,45,24]);
      }
      if(grid[32]==target){
        position.push([32,38,45,24]);
      }
    }

    // milieu
    if(grid[17]==target){
      if(grid[32]==target){
        position.push([17,32,24])
      }
      if(grid[30]==target){
        position.push([17,30,24])
      }
    }
    if(grid[31]==target){
      if(grid[16]==target){
        position.push([16,31,24])
      }
      if(grid[18]==target){
        position.push([18,31,24])
      }
    }
    if(grid[25]==target){
      if(grid[16]==target){
        position.push([16,25,24])
      }
      if(grid[30]==target){
        position.push([30,25,24])
      }
    }
    if(grid[23]==target){
      if(grid[18]==target){
        position.push([18,23,24])
      }
      if(grid[32]==target){
        position.push([32,23,24])
      }
    }

    // autre
    if(grid[16]==target && grid[9]==target){
      position.push([16,9,24])
    }
    if(grid[11]==target && grid[18]==target){
      position.push([11,18,24])
    }
    if(grid[30]==target && grid[37]==target){
      position.push([30,37,24])
    }
    if(grid[32]==target && grid[39]==target){
      position.push([32,39,24])
    }

    if(grid[15]==target && grid[16]==target){
      position.push([15,16,24])
    }
    if(grid[29]==target && grid[30]==target){
      position.push([29,30,24])
    }
    if(grid[18]==target && grid[19]==target){
      position.push([18,19,24])
    }
    if(grid[32]==target && grid[33]==target){
      position.push([32,33,24])
    }

    return position;
  }

  // Desktop Drag End
  onDragEnd(event: DragEvent) {
    const target = event.target as HTMLElement;
    target.classList.remove('dragging');
  }

  // Touch Start
  onTouchStart(event: TouchEvent, index: number) {
    if(this.isStarted){
      const touch = event.touches[0];
      this.touchStartX = touch.clientX;
      this.touchStartY = touch.clientY;
      this.touchedItemIndex = index;
      const target = event.target as HTMLElement;
      target.classList.add('dragging');
    } else {
      this.util.doToast('Cliquer sur Jouer pour commencer la partie',2000,'light');
    }

  }

  // Touch Move
  onTouchMove(event: TouchEvent) {
    event.preventDefault(); // Empêche le comportement par défaut de scroll
  }

  // Touch End
  onTouchEnd(event: TouchEvent, dropIndex: number) {
    if (this.touchedItemIndex === null) {
      return;
    }

    if(this.mouvementLeft>0 && this.isStarted){
      const touch = event.changedTouches[0];
      const touchEndX = touch.clientX;
      const touchEndY = touch.clientY;

      const distanceX = touchEndX - this.touchStartX;
      const distanceY = touchEndY - this.touchStartY;

      const draggedIndex = this.touchedItemIndex;

      const target = event.target as HTMLElement;
      target.classList.remove('dragging');

      if(distanceX != 0 && distanceY != 0){
        const direction = this.getDirectionMove(distanceX,distanceY);

        let index=-1;
        if(direction=='up'){
          if(draggedIndex>7){ // pour ne rien faire quand il s'agit de la permière ligne
            index = draggedIndex-8;
          }
        } else if (direction == 'down'){
          if(draggedIndex<55){
            index = draggedIndex+8;
          }
        } else if (direction == 'left'){
          if(draggedIndex!=0 && draggedIndex!=8 && draggedIndex!=16 && draggedIndex!=24 && draggedIndex!=32 && draggedIndex!=40 && draggedIndex!=48 && draggedIndex!=56){
            index = draggedIndex-1;
          }
        } else if (direction == 'right'){
          if(draggedIndex!=7 && draggedIndex!=15 && draggedIndex!=23 && draggedIndex!=31 && draggedIndex!=39 && draggedIndex!=47 && draggedIndex!=55 && draggedIndex!=63){
            index = draggedIndex+1;
          }
        }

        if (this.isValidDrag(draggedIndex, index)) {

          this.startIndex = draggedIndex;
          this.endIndex = index;

          this.swapItemsAndVerification();

        } else {
          //this.util.doToast(draggedIndex+'|'+index,1000);
        }
      }

      this.touchedItemIndex = null;
    } else {

    }
  }

  // Vérifie si le mouvement est valide (à une case seulement)
  isValidDrag(start: number, end: number): boolean {
    if(start!=-1 && end!=-1){
      this.swapItems(start,end);

      let name_start = this.items[start].name;
      let name_end = this.items[end].name;

      // recuperation des elements autour
      let grid_start = this.getGridCroix(start);
      let grid_end = this.getGridCroix(end);

      const valideStart = this.getValidePosition(grid_start[0],name_start);
      const valideEnd = this.getValidePosition(grid_end[0],name_end);
      this.swapItems(start,end);
      return valideStart.length > 0 || valideEnd.length > 0;
    } else {
      return false;
    }


  }

  getDirectionMove(diffX,diffY){
    if (Math.abs(diffX) > Math.abs(diffY)) {
      // Mouvement horizontal
      if (diffX > 0) {
        return 'right';
      } else {
        return 'left';
      }
    } else {
      // Mouvement vertical
      if (diffY > 0) {
        return 'down';
      } else {
        return 'up';
      }
    }
  }

  // Permute les éléments
  swapItems(draggedIndex: number, dropIndex: number) {
    const temp = this.items[draggedIndex];
    this.items[draggedIndex] = this.items[dropIndex];
    this.items[dropIndex] = temp;
  }

  changeItem() {
    // Appliquer fade-out et changer l'image avec un délai
    this.positions.forEach((pos, index) => {
      pos.forEach((i, itemIndex) => {
        const gridItem = document.getElementById('grid' + i);
        if (gridItem) {
          this.score+=this.items[i].point;
          let x = this.values;
          let index = this.values.findIndex(item => item.name === this.items[i].name);
          this.items[i] = this.getRandomElements(this.removeElementAtIndex(x,index));
        }
      });
    });

    this.getAllValidePositions();
    this.isMouvement(false);
  }

  removeElementAtIndex(arr: { point: number, name: string, percent: number }[], index: number) {
    // Créer une copie du tableau
    let newArray = [...arr];

    // Utiliser splice pour supprimer l'élément à l'indice donné
    newArray.splice(index, 1);

    // Retourner le nouveau tableau sans l'élément supprimé
    return newArray;
  }

  checkIfMouvementAvaible(): boolean {
    // Vérifie les alignements dans la grille
    let hasAlignment = false;

    // Vérifie les alignements horizontaux
    for (let row = 0; row < this.items.length / this.gridColumns; row++) {
      let count = 1;
      for (let col = 1; col < this.gridColumns; col++) {
        const currentIndex = row * this.gridColumns + col;
        const prevIndex = row * this.gridColumns + col - 1;
        if (this.items[currentIndex] === this.items[prevIndex]) {
          count++;
          if (count >= 3) {
            hasAlignment = true;
          }
        } else {
          count = 1;
        }
      }
    }

    // Vérifie les alignements verticaux
    for (let col = 0; col < this.gridColumns; col++) {
      let count = 1;
      for (let row = 1; row < this.items.length / this.gridColumns; row++) {
        const currentIndex = row * this.gridColumns + col;
        const prevIndex = (row - 1) * this.gridColumns + col;
        if (this.items[currentIndex] === this.items[prevIndex]) {
          count++;
          if (count >= 3) {
            hasAlignment = true;
          }
        } else {
          count = 1;
        }
      }
    }

    return hasAlignment;
  }

  canAlignAfterSwap(index1: number, index2: number): boolean {
    // Swap the items
    this.swapItems(index1, index2);
    const alignmentPossible = this.checkIfMouvementAvaible();
    // Swap them back
    this.swapItems(index1, index2);

    return alignmentPossible;
  }

  getGame(){
    const opt={
      name:'Jewel'
    };
    this.api.getList('games',opt).then((d:any)=>{
      this.game=d[0];
      const user=JSON.parse(localStorage.getItem('user_ka'));
      this.getLeaderBoard(user.id);
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

  showRule(){
    this.titre=this.game.name;
    this.message=this.game.rule;
    this.showMessage=true;
  }

  async endGame(){
    const opt ={
      user_id:this.user.id,
      game_id:this.game.id,
      points:this.score,
    };

    this.api.post('leader_scores',opt).then(d=>{
      this.titre = "Partie terminée";
      this.message ="Plus aucun mouvement disponible pour cette partie. Vos points ont été actualisés et votre classement mis à jour.";
      this.showMessage=true;
      this.showFooter=true;
      this.isLoose=false;
      this.isStarted=false;
      this.ionViewWillEnter();
    },q=>{
      this.util.handleError(q);
    });
  }

  getLeaderBoard(user_id){
    const opt = {
      user_id,
      game_id:this.game.id
    };

    this.api.post('show_leaders',opt).then((d:any)=>{
      let i = 1;
      let scores =[];
      for (const s in d.result) {
        if (d.result.hasOwnProperty(s)) {
          scores.push(
            {
              rank:i,
              user_name:s,
              point:d.result[s]
            }
          );
          i++;
        }
      }
      this.board.scores = scores;
      this.board.index = d.index;
      if(d.index!=-1){
        for (const s in d.u) {
          if (d.u.hasOwnProperty(s)) {
            this.my_score = {
              rank:d.index,
              user_name:s,
              point:d.u[s]
            };
          }
        }
      }
    })
  }

  closeMessage(event: string){
    this.showMessage=false;
    if(!this.isStarted||this.isLoose){
    }
  }

  startGame(){
    if(this.showMessage){
      this.showMessage=false;
    }

    if(this.user.point==undefined || this.user.point<this.mise){
      this.util.doToast('Pas assez de W point pour commencer à jouer. Veuillez recharger votre compte',5000);
    } else {
      //this.items = this.getRandomItems(this.values,this.itemCount);
      /*this.items[8]={
        point:500,
        name:'STAR',
        percent:15
      };
      this.items[9]={
        point:500,
        name:'STAR',
        percent:15
      };
      this.items[18]={
        point:500,
        name:'STAR',
        percent:15
      };
      this.items[11]={
        point:500,
        name:'STAR',
        percent:15
      };
      this.items[12]={
        point:500,
        name:'STAR',
        percent:15
      };*/
      // debit
      const opt ={
        user_id:this.user.id,
        game_id:this.game.id
      };
      this.api.post('start_game',opt).then(a=>{
        this.score=0;
        this.mouvementLeft = this.mouvement;
        this.isStarted=true;
        this.user.point-=this.mise;
        this.showFooter=false;
        this.getAllValidePositions();
        this.isMouvement(false);
      },q=>{
        this.util.handleError(q);
      });
    }
  }

  close(){
    this.admob.showInterstitial();
    this.navCtrl.navigateRoot('/game');
  }
}
