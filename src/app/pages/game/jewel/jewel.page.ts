import {AfterViewInit, Component, OnInit} from '@angular/core';
import * as _ from "lodash";
import {UtilProvider} from "../../../providers/util/util";
import {all} from "axios";

@Component({
  selector: 'app-jewel',
  templateUrl: './jewel.page.html',
  styleUrls: ['./jewel.page.scss'],
})
export class JewelPage implements OnInit, AfterViewInit {

  items:any = [];

  mouvementLeft=10;
  touchStartX: number | null = null;
  touchStartY: number | null = null;

  score=0;
  itemCount=64;
  
  startIndex=-1;
  endIndex=-1;
  direction="";

  private values = [
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
    'CYAN': 'assets/img/jewel/cyan.png',
  };

  constructor(
    private util:UtilProvider
  ) {

  }

  ngOnInit() {
    this.items = this.getRandomItems(this.values,this.itemCount);
    console.log(this.items);
  }

  ngAfterViewInit(){
    setTimeout(()=>{
      this.getAllValidePositions();
      //this.checkAlignments();
      //this.possibleMouvement = this.getPossibleAlignments();
    },1500)
  }

  getRandomElements(arr: any[], numElements: number): string[] {
    const result: string[] = [];

    for (let i = 0; i < numElements; i++) {
      const randomIndex = Math.floor(Math.random() * arr.length); // Sélectionner un indice aléatoire
      result.push(arr[randomIndex]);
    }

    return result;
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
    this.draggedItemIndex = index;
    const target = event.target as HTMLElement;
    target.classList.add('dragging');
    event.dataTransfer?.setData('text/plain', index.toString());
    event.dataTransfer!.effectAllowed = "move";
  }

  // Desktop Drag Over
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.dataTransfer!.dropEffect = "move";
  }

  // Desktop Drop
  onDrop(event: DragEvent, dropIndex: number) {
    event.preventDefault();
    const draggedIndex = this.draggedItemIndex;

    const target = event.target as HTMLElement;
    target.classList.remove('dragging');
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      return;
    }
    if (this.isValidMove(draggedIndex, dropIndex)) {

      this.startIndex = draggedIndex;
      this.endIndex = dropIndex;

      this.swapItemsAndVerification();

      //this.swapItems(draggedIndex, dropIndex);

      //this.checkAlignments(); // Vérifie les alignements après chaque déplacement

    }

    this.draggedItemIndex = null;
  }
  
  swapItemsAndVerification(){
    this.swapItems(this.startIndex,this.endIndex);
    let start = this.startIndex;
    let end = this.endIndex;
    let name_start = this.items[start].name;
    let name_end = this.items[end].name;
    // recuperation des elements autour de startindex
    let grid_start = this.getGrid(start);
    let grid_end = this.getGrid(end);


    let positionStart = this.getValidePosition(grid_start[0],name_start);
    let positionEnd = this.getValidePosition(grid_end[0],name_end);

    this.changeItemByPosition(positionStart,grid_start[1]);
    this.changeItemByPosition(positionEnd,grid_end[1]);
    this.mouvementLeft--;
    this.getAllValidePositions();
    const mouv = this.getPossibleAlignments();
    if(mouv.length==0){
      this.util.doToast('Aucun mouvement disponible',2000);
      this.mouvementLeft=-20;
    } else {
      //console.log('mouv possible',mouv);

    }
    //la fonction getValidatePosition ne marche pas
  }

  getGrid(index){
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
    
    //gauche
    if(index!=0 && index!=8 && index!=16 && index!=24 && index!=32 && index!=40 && index!=48 && index!=56){
      g1=index-1;
      if(index!=1 && index!=9 && index!=17 && index!=25 && index!=33 && index!=41 && index!=49 && index!=57){
        g2=index-2;
      }
    }

    //droit
    if(index!=7 && index!=8 && index!=15 && index!=23 && index!=31 && index!=39 && index!=47 && index!=55){
      d1=index+1;
      if(index!=7 && index!=15 && index!=23 && index!=31 && index!=39 && index!=47 && index!=55 && index!=63){
        d2=index+2;
      }
    }

    //haut
    if(index>7){
      h1=index-8;
      if(index>15){
        h2=index-16;
      }
    }

    //bas
    if(index<56){
      b1=index+8;
      if(index<48){
        b2=index+16;
      }
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
  
  validateMouvement(gridIndex,positions,index){
    console.log(positions);
    // Supprimer les doublons
    let uniquePosition:any = positions.reduce((acc, curr) => {
      curr.forEach(item => {
        if (!acc.includes(gridIndex[item])) {
          acc.push(gridIndex[item]);
        }
      });
      return acc;
    }, []);

    console.log(uniquePosition);

    uniquePosition.forEach(v=>{
      const gridItem = document.getElementById('grid' + v);
      if(gridItem){
        gridItem.classList.add('fade-out');
        setTimeout(()=>{

        },500);
        this.score+=this.items[v].point;
        console.log(this.items[v].name,this.items[index].name);
        if(this.items[v].name == this.items[index].name){
          this.items[v] = this.getRandomElements(this.values, 1)[0];
        }

        // Supprimer la classe fade-out et ajouter la classe fade-in
        gridItem.classList.remove('fade-out');
        gridItem.classList.add('fade-in');
      }
    });
    this.items[index] = this.getRandomElements(this.values, 1)[0];
    this.score+=this.items[index].point;
  }
  
  getCount(tab,item){
    let count=0;
    for(let i=0;i<tab.length;i++){
      if(item==tab[i]){
        count++;
      }
    }
    return count;
  }

  getValidePosition(grid: string[], target: string): number[][] {
    let position = [];
    //vertical
    if(grid[2]===grid[7] && grid[7]===target){
      position.push([2,7,12]);
    }
    if(grid[17]==grid[7] && grid[7]==target){
      position.push([17,7,12]);
    }
    if(grid[17]==grid[7] && grid[2]==grid[7] && grid[7]==target){
      position.push([17,7,12,2]);
    }

    if(grid[22]===grid[17] && grid[17]===target){
      position.push([22,17,12]);
    }
    if(grid[17]==grid[22] && grid[7]==grid[22] && grid[22]==target){
      position.push([22,17,12,7]);
    }

    if(grid[2]===grid[17] && grid[22]===grid[17] && grid[7]===grid[17] && grid[17]===target){
      position.push([22,17,7,2,12]);
    }

    // horizontal
    if(grid[10]==grid[11] && grid[11]==target){
      position.push([10,11,12]);
    }
    if(grid[11]==grid[13] && grid[11]==target){
      position.push([11,13,12]);
    }
    if(grid[13]==grid[14] && grid[13]==target){
      position.push([14,13,12]);
    }
    if(grid[10]==grid[13] && grid[11]==grid[13] && grid[13]==target){
      position.push([11,10,13,12]);
    }
    if(grid[11]==grid[13] && grid[14]==grid[13] && grid[13]==target){
      position.push([11,14,13,12]);
    }
    if(grid[10]==grid[14] &&grid[11]==grid[14] && grid[13]==grid[14] && grid[14]==target){
      position.push([10,11,13,14,12]);
    }

    return position;
  }

  getAllValidePositions(){
    let allPositions=[];
    for(let i=0;i<64;i++){
      const grid = this.getGrid(i);
      const positions = this.getValidePosition(grid[0],this.items[i].name);
      positions.forEach(pos=>{
        let po =[];
        pos.forEach(v=>{
          po.push(grid[1][v]);
        });
        allPositions.push(po);
      });
    }
    this.positions = allPositions;
    if(allPositions.length>0){
      this.changeItem();
    }
  }

  // Desktop Drag End
  onDragEnd(event: DragEvent) {
    const target = event.target as HTMLElement;
    target.classList.remove('dragging');
  }

  // Touch Start
  onTouchStart(event: TouchEvent, index: number) {
    const touch = event.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.touchedItemIndex = index;
    const target = event.target as HTMLElement;
    target.classList.add('dragging');
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

    const touch = event.changedTouches[0];
    const touchEndX = touch.clientX;
    const touchEndY = touch.clientY;

    const distanceX = touchEndX - this.touchStartX;
    const distanceY = touchEndY - this.touchStartY;

    const draggedIndex = this.touchedItemIndex;

    const target = event.target as HTMLElement;
    target.classList.remove('dragging');

    if(distanceX != 0 && distanceY != 0){
      //this.util.doToast(distanceX+'|'+distanceY,1000);
      const direction = this.getDirectionMove(distanceX,distanceY);
      this.swapItemsByDirection(draggedIndex, direction);
      //this.swapItemsAndVerification();
      //this.checkAlignments(); // Vérifie les alignements après chaque déplacement
    }

    this.touchedItemIndex = null;
  }

  // Vérifie si le mouvement est valide (à une case seulement)
  isValidMove(start: number, end: number): boolean {
    if(start!=-1 && end!=-1){
      //this.swapItems(start,end);

      let name_start = this.items[start].name;
      let name_end = this.items[end].name;

      // recuperation des elements autour
      let grid_start = this.getGrid(start);
      let grid_end = this.getGrid(end);

      const valideStart = this.getValidePosition(grid_start[0],name_start);
      const valideEnd = this.getValidePosition(grid_end[0],name_end);
      //console.log(valideStart,valideEnd);
      //this.swapItems(start,end);
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

  // Permute les éléments
  swapItemsByDirection(draggedIndex: number, direction: string) {
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

    this.swapItems(draggedIndex,index);

    if(this.isValidMove(draggedIndex,index)){
      this.swapItems(draggedIndex,index);
      this.startIndex=draggedIndex;
      this.endIndex=index;
      this.swapItemsAndVerification();
    } else {
      this.swapItems(draggedIndex,index);
    }


  }

  checkAlignments() {
    this.alignedItemCount = 0;
    this.positions = []; // Réinitialiser la variable positions

    const rowCount = this.gridColumns;
    const colCount = this.items.length / this.gridColumns;

    // Vérifie les alignements horizontaux
    for (let row = 0; row < colCount; row++) {
      let count = 1;
      let startIndex = row * rowCount;
      let alignGroup: number[] = [startIndex];
      for (let col = 1; col < rowCount; col++) {
        const currentIndex = startIndex + col;
        const prevIndex = startIndex + col - 1;
        if (this.items[currentIndex] === this.items[prevIndex]) {
          count++;
          alignGroup.push(currentIndex);
        } else {
          if (count >= 3) {
            this.positions.push([...alignGroup]);
            this.alignedItemCount++;
          }
          count = 1;
          alignGroup = [currentIndex];
        }
      }
      // Vérifie la dernière séquence dans la ligne
      if (count >= 3) {
        this.positions.push([...alignGroup]);
        this.alignedItemCount++;
      }
    }


    // Vérifie les alignements verticaux
    for (let col = 0; col < rowCount; col++) {
      let count = 1;
      let startIndex = col;
      let alignGroup: number[] = [startIndex];
      for (let row = 1; row < colCount; row++) {
        const currentIndex = startIndex + row * rowCount;
        const prevIndex = startIndex + (row - 1) * rowCount;
        if (this.items[currentIndex] === this.items[prevIndex]) {
          count++;
          alignGroup.push(currentIndex);
        } else {
          if (count >= 3) {
            this.positions.push([...alignGroup]);
            this.alignedItemCount++;
          }
          count = 1;
          alignGroup = [currentIndex];
        }
      }
      // Vérifie la dernière séquence dans la colonne
      if (count >= 3) {
        this.positions.push([...alignGroup]);
        this.alignedItemCount++;
      }
    }

    console.log(`Nombre d'éléments alignés : ${this.alignedItemCount}`);
    console.log('Indices des éléments alignés :', this.positions);
    if(this.alignedItemCount>0){
      this.changeItem();
    }
  }

  changeItem() {
    let bonus = 0;
    // Appliquer fade-out et changer l'image avec un délai
    this.positions.forEach((pos, index) => {
      if(pos.length==4){
        bonus=10;
      } else if(pos.length>=5){
        bonus=20;
      }
      pos.forEach((i, itemIndex) => {
        const gridItem = document.getElementById('grid' + i);
        if (gridItem) {
          this.score+=this.items[i].point+bonus;
          this.items[i] = this.getRandomElements(this.values, 1)[0];
        }
      });
    });

    this.getAllValidePositions();
  }

  changeItemByPosition(positions,gridIndex) {
    positions = positions.reduce((acc, curr) => {
      curr.forEach(item => {
        if (!acc.includes(gridIndex[item])) {
          acc.push(gridIndex[item]);
        }
      });
      return acc;
    }, []);
    let bonus = 0;

    // Appliquer fade-out et changer l'image avec un délai
    positions.forEach((i, itemIndex) => {
      const gridItem = document.getElementById('grid' + i);
      if (gridItem) {
        this.score+=this.items[i].point+bonus;
        this.items[i] = this.getRandomElements(this.values, 1)[0];
      }
    });
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

  getPossibleAlignments(): { positions: number[][], type: 'horizontal' | 'vertical' }[] {
    const possibleAlignments = [];
    
    let items = this.items;

    for (let i = 0; i < items.length; i++) {
      const rowIndex = Math.floor(i / this.gridColumns);
      const colIndex = i % this.gridColumns;

      // Vérifier les mouvements vers la droite
      if (colIndex < this.gridColumns - 1) {
        if (this.canAlignAfterSwap(i, i + 1)) {
          possibleAlignments.push({ position: i, direction: 'right' });
        }
      }

      // Vérifier les mouvements vers la gauche
      if (colIndex > 0) {
        if (this.canAlignAfterSwap(i, i - 1)) {
          possibleAlignments.push({ position: i, direction: 'left' });
        }
      }

      // Vérifier les mouvements vers le bas
      if (rowIndex < items.length / this.gridColumns - 1) {
        if (this.canAlignAfterSwap(i, i + this.gridColumns)) {
          possibleAlignments.push({ position: i, direction: 'down' });
        }
      }

      // Vérifier les mouvements vers le haut
      if (rowIndex > 0) {
        if (this.canAlignAfterSwap(i, i - this.gridColumns)) {
          possibleAlignments.push({ position: i, direction: 'up' });
        }
      }
    }

    return possibleAlignments;
  }

  canAlignAfterSwap(index1: number, index2: number): boolean {
    // Swap the items
    this.swapItems(index1, index2);
    const alignmentPossible = this.checkIfMouvementAvaible();
    // Swap them back
    this.swapItems(index1, index2);

    return alignmentPossible;
  }

}
