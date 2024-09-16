import {Component, OnInit, ViewChild} from '@angular/core';
import {IonModal, MenuController, ModalController, NavController} from "@ionic/angular";
import {ApiProvider} from "../../providers/api/api";
import {UtilProvider} from "../../providers/util/util";
import {NavigationExtras, Router} from "@angular/router";
import * as moment from "moment";
import * as _ from "lodash";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  @ViewChild(IonModal) modal: IonModal;

  public user_name="";
  private user:any={};
  private user_id:number;
  public customers:any=[];
  public products:any=[];
  public bills:any=[];
  role="";

  games:any=[];
  players:any=[];
  best_game:any=[];
  sum=0;
  gain=0;
  perte=0;
  dep_user=0;
  is_loading=true;

  constructor(
    private api:ApiProvider
  ) {

  }

  ngOnInit() {
  }

  ionViewWillEnter(){
    let user = JSON.parse(localStorage.getItem('user_ka'));
    this.user_id=user.id;
    this.user=user;
    this.getGames();
    this.getGain();
    this.getPlayers();

    //verfication si l'utilisateur est déjà rattaché à un store

  }

  getGames(){
    const opt={
      should_paginate:false,
      _sort:'count',
      '_sortDir':"desc"
    };
    this.dep_user=0;
    this.api.getList('games',opt).then((d:any)=>{
      this.games=d;
      d.forEach(v=>{
        this.dep_user+=v.amount;
      })
    })
  }

  getPlayers(){
    this.players=[];
    const opt={
      should_paginate:false,
      status:3,
    };

    this.api.post('best_payers',opt).then((d:any)=>{
      let i = 1;
      for (const s in d) {
        if (d.hasOwnProperty(s)) {
          this.players.push(
            {
              rank:i,
              user_name:s,
              point:d[s]
            }
          );
          i++;
        }
      }
    })
  }

  getGain(){

    this.api.getList('gain',0).then((d:any)=>{
      this.gain=d.gain;
      this.perte=d.perte;
    })
  }

  // jeux qui paye le plus
  getScore(){
    this.best_game=[];
    const opt = {
      should_paginate:false,
    }

    this.api.getList('best_game',opt).then((d:any)=>{
      let i = 1;
      for (const s in d) {
        if (d.hasOwnProperty(s)) {
          this.best_game.push(
            {
              rank:i,
              name:s,
              point:d[s]
            }
          );
          i++;
        }
      }
    })

  }

  doRefresh(event) {
    this.getGames();
    this.getGain();
    this.getPlayers();
    this.getScore();
    setTimeout(() => {
      console.log('Async operation has ended');
      event.target.complete();
    }, 500);
  }
}
