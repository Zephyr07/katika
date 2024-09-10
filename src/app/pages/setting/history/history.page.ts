import { Component, OnInit } from '@angular/core';
import {ApiProvider} from "../../../providers/api/api";
import * as _ from "lodash";

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
})
export class HistoryPage implements OnInit {
  scores=[];
  items=[];
  constructor(
    private api:ApiProvider
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter(){
    const user = JSON.parse(localStorage.getItem('user_ka'));
    const opt = {
      user_id:user.id,
      _sortDir:'desc',
      _includes:'game',
      should_paginate:false
    }

    this.api.getList('scores',opt).then((d:any)=>{
      d.forEach(v=>{
        this.items.push({
          name:v.game.name,
          amount:v.jackpot,
          date:v.created_at
        })
      });
      this.getPayment(user.id);
    })
  }

  getPayment(user_id){
    const opt = {
      user_id:user_id,
      status:3,
      should_paginate: false
    };

    this.api.getList('payments',opt).then((d:any)=>{
      d.forEach(v=>{
        this.items.push({
          name:'Recharge du compte',
          amount:v.amount,
          date:v.created_at
        })
      });

      this.items = _.sortBy(this.items,'date').reverse();
    })
  }

}
