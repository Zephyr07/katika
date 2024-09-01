import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'app-modal-message',
  templateUrl: './modal-message.component.html',
  styleUrls: ['./modal-message.component.scss'],
})
export class ModalMessageComponent  implements OnInit {

  @Input() titre:string;
  @Input() message:string;
  @Input() isFirstTime:boolean;

  @Output() actionEmitted = new EventEmitter();

  private screenWidth: number = window.innerWidth;

  gridGap="";
  largeur="";

  constructor() {
    if(this.screenWidth<310){
      this.largeur="80%";
    } else {
      this.largeur="300px";
    }
  }

  ngOnInit() {

  }

  closeMessage(){
    this.actionEmitted.emit('Action effectuée');
  }

}
