import { Component, OnInit } from '@angular/core';
import {ApiProvider} from "../../../providers/api/api";

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
})
export class HistoryPage implements OnInit {
  scores=[];
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
      this.scores =d;
    })
  }

}
