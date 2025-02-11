import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GamePage } from './game.page';

const routes: Routes = [
  {
    path: '',
    component: GamePage
  },
  {
    path: 'triple-choice',
    loadChildren: () => import('./triple-choice/triple-choice.module').then( m => m.TripleChoicePageModule)
  },
  {
    path: 'memory-game',
    loadChildren: () => import('./memory-game/memory-game.module').then( m => m.MemoryGamePageModule)
  },
  {
    path: 'aviator',
    loadChildren: () => import('./aviator/aviator.module').then( m => m.AviatorPageModule)
  },
  {
    path: 'puzzle',
    loadChildren: () => import('./puzzle/puzzle.module').then( m => m.PuzzlePageModule)
  },
  {
    path: 'fortune',
    loadChildren: () => import('./fortune/fortune.module').then( m => m.FortunePageModule)
  },
  {
    path: 'apple',
    loadChildren: () => import('./apple/apple.module').then( m => m.ApplePageModule)
  },
  {
    path: 'dice',
    loadChildren: () => import('./dice/dice.module').then( m => m.DicePageModule)
  },
  {
    path: 'jewel',
    loadChildren: () => import('./jewel/jewel.module').then( m => m.JewelPageModule)
  },
  {
    path: 'reaper',
    loadChildren: () => import('./reaper/reaper.module').then( m => m.ReaperPageModule)
  },
  {
    path: 'machine3x',
    loadChildren: () => import('./machine3x/machine3x.module').then( m => m.Machine3xPageModule)
  },
  {
    path: 'machine5x',
    loadChildren: () => import('./machine5x/machine5x.module').then( m => m.Machine5xPageModule)
  },
  {
    path: 'multiplicator',
    loadChildren: () => import('./multiplicator/multiplicator.module').then( m => m.MultiplicatorPageModule)
  },
  {
    path: 'plusmoins',
    loadChildren: () => import('./plusmoins/plusmoins.module').then( m => m.PlusmoinsPageModule)
  },
  {
    path: 'lucky',
    loadChildren: () => import('./lucky/lucky.module').then( m => m.LuckyPageModule)
  },
  {
    path: 'tile-2048',
    loadChildren: () => import('./tile-2048/tile-2048.module').then( m => m.Tile2048PageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GamePageRoutingModule {}
