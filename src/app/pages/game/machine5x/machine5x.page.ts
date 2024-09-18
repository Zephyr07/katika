import { Component, OnInit } from '@angular/core';
import {UtilProvider} from "../../../providers/util/util";

@Component({
  selector: 'app-machine5x',
  templateUrl: './machine5x.page.html',
  styleUrls: ['./machine5x.page.scss'],
})
export class Machine5xPage implements OnInit {

  reels: string[] = ['🍒', '🍋', '🍊', '🍇', '🍉','🍎','🍑','🥑','🍓','🍍']; // Symbols on the reel
  slots: string[][] = [[], [], []]; // Three arrays for each reel
  reelPositions: number[] = [0, 0, 0]; // Current positions for each reel
  spinning: boolean = false; // Spin state
  targetIndexes: number[] = [0, 0, 0]; // Target positions for the reels
  times: number[] = [2000, 2500, 3000]; // Target positions for the reels
  spinningReel: boolean[] = [false, false, false]; // Target positions for the reels

  constructor(
    private util:UtilProvider
  ) {
    this.initializeReels();
  }

  ngOnInit() {
  }

  initializeReels() {
    for (let i = 0; i < 3; i++) {
      this.slots[i] = [...this.reels, ...this.reels, ...this.reels,...this.reels, ...this.reels, ...this.reels,...this.reels, ...this.reels, ...this.reels,...this.reels, ...this.reels, ...this.reels]; // Repeat symbols for smooth looping
      this.slots[i]=this.util.shuffleArray(this.slots[i]);
    }
  }

  // Spin the slot machine to the specified target indexes
  spin() {
    if (this.spinning) return; // Prevent multiple spins at the same time
    let target = [
      this.util.randomIntInRange(0,8),
      this.util.randomIntInRange(0,8),
      this.util.randomIntInRange(0,8)
    ];
    this.targetIndexes = target;
    console.log(target);
    for (let i = 0; i < 3; i++) {
      this.spinningReel[i]=true;
      //this.spinReel(i, targetIndexes[i]);
    }
    this.spinToTarget(target);
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
      this.checkIfAllReelsStopped();
    }, spins * spinSpeed);
  }

  private x=[0,0,0];
  spinToTarget(target:number[]){
    // reel 1
    const interval1 = setInterval(()=>{
      // ça tourne jusqu'a ce que apres le temps, sa s'arrete au prochain indice choisi
      const totalSymbols = this.slots[0].length;
      let currentPosition = this.reelPositions[0];

      currentPosition = (currentPosition + 1) % totalSymbols;
      this.reelPositions[0] = currentPosition;

      this.x[0]+=100;
      if(this.x[0]>=this.times[0] && this.slots[0][(currentPosition+1)% totalSymbols]==this.reels[target[0]]){
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
        // stop du time
        this.spinningReel[2]=false;
        clearInterval(interval3);
        this.x[2]=0;
      }
    },100);
  }

  // Check if all reels have stopped spinning
  checkIfAllReelsStopped() {
    if (this.reelPositions.every((pos, i) => pos === this.targetIndexes[i])) {
      this.spinning = false;
    }
  }

}
