import { Component, OnInit } from '@angular/core';
import {ApiProvider} from "../../providers/api/api";
import {NavController, Platform} from "@ionic/angular";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-loading',
  templateUrl: './loading.page.html',
  styleUrls: ['./loading.page.scss'],
})
export class LoadingPage implements OnInit {
  isMaintenance=false;
  isUpgrade=false;
  link="";
  version:number;

  constructor(
    private api:ApiProvider,
    private navCtrl:NavController,
    private platform:Platform
  ) { }

  ngOnInit() {

    this.api.getSettings().then((d:any)=>{
      if(this.platform.is('ios')){
        // redirection vers app store
        this.version=d.ios.version;
      } else {
        // redirection vers play store
        this.version=d.android.version;
      }
      if(d.maintenance==true){
        this.isMaintenance=true;
      } else if(environment.code < this.version){
        // mise à jour disponible
        if(this.platform.is('ios')){
          this.link=d.ios.link;
        } else {
          this.link=d.android.link;
        }
        this.isUpgrade=true;
      } else {
        // on part chez home
        this.navCtrl.navigateRoot(['/home']);
      }

    })
  }

  update(){
    window.location.href=this.link;
  }

}
