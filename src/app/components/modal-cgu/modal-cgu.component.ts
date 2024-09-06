import { Component, OnInit } from '@angular/core';
import {ModalController} from "@ionic/angular";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-modal-cgu',
  templateUrl: './modal-cgu.component.html',
  styleUrls: ['./modal-cgu.component.scss'],
})
export class ModalCguComponent implements OnInit {
  version = environment.version;
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
