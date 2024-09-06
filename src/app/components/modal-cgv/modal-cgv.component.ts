import { Component, OnInit } from '@angular/core';
import {ModalController} from "@ionic/angular";

@Component({
  selector: 'app-modal-cgv',
  templateUrl: './modal-cgv.component.html',
  styleUrls: ['./modal-cgv.component.scss'],
})
export class ModalCgvComponent  implements OnInit {
  constructor(
    private modalController:ModalController
  ) { }

  ngOnInit() {}

  dismiss() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalController.dismiss({
      'dismissed': true
    });
  }
}
