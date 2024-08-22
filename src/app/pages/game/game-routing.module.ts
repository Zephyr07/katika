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

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GamePageRoutingModule {}
