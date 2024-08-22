import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-game-block',
  templateUrl: './game-block.component.html',
  styleUrls: ['./game-block.component.scss'],
})
export class GameBlockComponent  implements OnInit {
  @Input() value:string;
  constructor() { }

  ngOnInit() {

  }

}
