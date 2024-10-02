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
  games:any={
    crystal:{},
    truck:{},
    memory:{},
    bats:{},
    reaper:{},
    jewel:{},
    dice:{},
    fruits:{},
    fortune:{},
    multiplicator:{},
    plusmoins:{},
    bigslot:{},

  };
  showLoading=true;
  constructor(
    private router:Router,
    private admob:AdmobProvider,
    private api:ApiProvider
  ) {

  }

  ngOnInit() {
  }

  ionViewWillEnter(){
    this.api.getSettings().then((d:any)=>{
      this.games = d.game_settings;
    });
    //this.admob.loadInterstitial();

    if(this.api.checkUser()){
      this.user=JSON.parse(localStorage.getItem('user_ka'));
      this.api.getList('auth/me',{id:this.user.id}).then((a:any)=>{
        this.user = a.data.user;
        localStorage.setItem('user_ka',JSON.stringify(this.user));
        this.showLoading=false;
      });
    } else {
      this.showLoading=false;
    }
  }


  goToGame(t){
    //this.admob.showInterstitial();
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
    } else if(t=='reaper'){
      this.router.navigateByUrl('game/reaper');
    } else if(t=='dices'){
      this.router.navigateByUrl('game/dice');
    } else if(t=='jewel'){
      this.router.navigateByUrl('game/jewel');
    } else if(t=='fruits'){
      this.router.navigateByUrl('game/machine3x');
    } else if(t=='multiplicator'){
      this.router.navigateByUrl('game/multiplicator');
    } else if(t=='plusmoins'){
      this.router.navigateByUrl('game/plusmoins');
    } else if(t=='ace'){
      this.router.navigateByUrl('game/machine5x');
    }
  }
}
