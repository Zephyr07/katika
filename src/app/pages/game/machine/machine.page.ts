import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-machine',
  templateUrl: './machine.page.html',
  styleUrls: ['./machine.page.scss'],
})
export class MachinePage implements OnInit {
  reels: string[] = ['🍒', '🍋', '🍊', '🍇', '🍉'];
  slots: string[][] = [[], [], []]; // Three arrays for each reel
  spinning: boolean = false;
  message: string = '';
  spinningReels: boolean[] = [false, false, false]; // To control individual reel spinning



  constructor() {
    this.initializeReels();
  }

  ngOnInit() {
  }

  // Initialize reels with repeated symbols
  initializeReels() {
    for (let i = 0; i < 3; i++) {
      this.reels=this.shuffleArray(this.reels);
      this.slots[i] = [...this.reels, ...this.reels, ...this.reels]; // Repeat symbols for smooth looping
      //this.slots[i] = this.shuffleArray(this.slots[i]);
    }
  }

  shuffleArray<T>(array: T[]): T[] {
    let currentIndex = array.length, randomIndex;

    // Tant qu'il reste des éléments à mélanger...
    while (currentIndex !== 0) {
      // Choisir un élément restant...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // Et échanger l'élément actuel avec celui aléatoire
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;
  }

  // Start spinning
  spin() {
    if (this.spinning) return; // Prevent multiple spins at the same time

    this.initializeReels();
    this.spinning = true;
    this.message = '';
    this.spinningReels = [true, true, true]; // Start all reels spinning

    // Spin each reel with a delay to simulate independent spinning
    setTimeout(() => this.stopReel(0), 2000); // Stop reel 1 after 2 seconds
    setTimeout(() => this.stopReel(1), 2500); // Stop reel 2 after 2.5 seconds
    setTimeout(() => this.stopReel(2), 3000); // Stop reel 3 after 3 seconds
  }

  randomIntInRange(min, max) {
    return parseInt((Math.random() * (max - min) + min).toFixed(2));
  }

  // Stop individual reel and check for win after all reels stop
  stopReel(reelIndex: number) {
    this.spinningReels[reelIndex] = false;

    // Check if all reels have stopped
    if (this.spinningReels.every(spinning => !spinning)) {
      this.spinning = false;
      this.checkWin();
    }
  }

  // Check if the player has won
  checkWin() {
    const visibleSymbols = this.slots.map(reel => reel[1]); // Check the middle row
    const [first, second, third] = visibleSymbols;
    console.log(first,second,third);
    if (first === second && second === third) {
      this.message = '🎉 Jackpot! You Win!';
    } else {
      this.message = 'Try Again!';
    }
  }
}
