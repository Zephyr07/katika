import {Component, EventEmitter, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-modal-loading',
  templateUrl: './modal-loading.component.html',
  styleUrls: ['./modal-loading.component.scss'],
})
export class ModalLoadingComponent  implements OnInit {

  @Output() actionEmitted = new EventEmitter();

  constructor() { }

  ngOnInit() {

  }

  closeMessage(){
    this.actionEmitted.emit('Action effectuée');
  }

}
