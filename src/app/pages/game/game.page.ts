import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {AdmobProvider} from "../../providers/admob/AdmobProvider";
import {ApiProvider} from "../../providers/api/api";

@Component({
  selector: 'app-game',
  templateUrl: './game.page.html',
  styleUrls: ['./game.page.scss'],
})
export class GamePage implements OnInit {
  user:any={};
  constructor(
    private router:Router,
    private admob:AdmobProvider,
    private api:ApiProvider
  ) {

  }

  ngOnInit() {
  }

  ionViewWillEnter(){

    if(this.api.checkUser()){
      this.user=JSON.parse(localStorage.getItem('user_ka'));
      this.api.getList('auth/me',{id:this.user.id}).then((a:any)=>{
        this.user = a.data.user;
        localStorage.setItem('user_ka',JSON.stringify(this.user));
      });
    } else {

    }
  }

  ionViewWillLeave(){

  }
  goToGame(t){
    if(t=='bats'){
      this.router.navigateByUrl('game/triple-choice');
    } else if(t=='memory'){
      this.router.navigateByUrl('game/memory-game');
    } else if(t=='crash'){
      this.router.navigateByUrl('game/aviator');
    } else if(t=='puzzle'){
      this.router.navigateByUrl('game/puzzle');
    } else if(t=='fortune'){
      this.router.navigateByUrl('game/fortune');
    } else if(t=='grenade'){
      this.router.navigateByUrl('game/apple');
    }
  }
}
