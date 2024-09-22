import {Component, OnInit, ViewChild} from '@angular/core';
import {IonModal} from "@ionic/angular";
import {ApiProvider} from "../../providers/api/api";
import * as moment from "moment";
import {UtilProvider} from "../../providers/util/util";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  @ViewChild(IonModal) modal: IonModal;

  showLoading=true;

  public user_name="";
  private user:any={};
  private user_id:number;
  public customers:any=[];
  public products:any=[];
  public bills:any=[];
  periode="day";
  custom_date:any=null;

  stories:any=[];
  players:any=[];
  best_game:any=[];
  sum=0;
  gain=0;
  perte=0;
  dep_user=0;
  is_loading=true;

  public alertButtons = [
    {
      text: 'OK',
      handler: (data:any) => {
        if(data!=this.periode){
          this.periode = data;
          if(data!='custom')
            this.getStories();
        }
      }
    }
  ];
  public alertInputs = [
    {
      label: 'Aujourd\'hui',
      type: 'radio',
      value: 'day',
    },
    {
      label: 'Hier',
      type: 'radio',
      value: 'yesterday',
    },
    {
      label: 'Ce mois-ci',
      type: 'radio',
      value: 'this_month',
    },
    {
      label: 'Les 7 derniers jours',
      type: 'radio',
      value: 'week',
    },
    {
      label: 'Les 30 derniers jours',
      type: 'radio',
      value: 'month',
    },
    {
      label: 'Cette année',
      type: 'radio',
      value: 'year',
    },
    {
      label: 'Autre date',
      type: 'radio',
      value: 'custom',
    },
  ];

  constructor(
    private api:ApiProvider,
    private util:UtilProvider
  ) {

  }

  ngOnInit() {
  }

  loadStories(){
    this.showLoading=true;
    this.api.getList('setup',{}).then((d:any)=>{
      console.log(d);
      this.getStories();
      this.showLoading=false;
    },q=>{
      this.util.handleError(q);
      this.showLoading=false;
    })
  }

  ionViewWillEnter(){
    let user = JSON.parse(localStorage.getItem('user_ka'));
    this.user_id=user.id;
    this.user=user;
    this.getStories();
    this.getGain();
    this.getPlayers();

    //verfication si l'utilisateur est déjà rattaché à un store

  }

  getStories(){
    this.showLoading=true;

    const opt={
      should_paginate:false,
      _sort:'amount',
      _sortDir:"desc",
      _includes:'game',
      'date-gt':moment().format("YYYY-MM-01"),
      'date-get':moment().format("YYYY-MM-01"),
      'date-let':moment().format("YYYY-MM-DD"),
      'date-lt':moment().format("YYYY-MM-DD"),
    };

    if(this.periode =='day'){
      delete opt['date-gt'];
      delete opt['date-let'];
      opt['date-get']=moment().format("YYYY-MM-DD");
      opt['date-lt']=moment().add('1','day').format("YYYY-MM-DD");
    } else if(this.periode =='yesterday'){
      delete opt['date-gt'];
      delete opt['date-let'];
      opt['date-get']=moment().add('-1','day').format("YYYY-MM-DD");
      opt['date-lt']=moment().format("YYYY-MM-DD");
    } else if (this.periode == "week"){
      delete opt['date-get'];
      delete opt['date-lt'];
      opt['date-gt']=moment().add(-7,'day').format("YYYY-MM-DD");
      opt['date-let']=moment().format("YYYY-MM-DD");
    } else if (this.periode == "month"){
      delete opt['date-get'];
      delete opt['date-lt'];
      opt['date-gt']=moment().add(-1,'month').format("YYYY-MM-DD");
      opt['date-let']=moment().format("YYYY-MM-DD");
    } else if (this.periode == "this_month"){
      delete opt['date-gt'];
      delete opt['date-lt'];
      opt['date-get']=moment().format("YYYY-MM-01");
      opt['date-let']=moment().format("YYYY-MM-DD");
    } else if (this.periode == "year"){
      delete opt['date-gt'];
      delete opt['date-lt'];
      opt['date-get']=moment().format("YYYY-01-01");
      opt['date-let']=moment().format("YYYY-12-31");
    }
    if(this.custom_date){
      const date = this.custom_date.split('T')[0];
      delete opt['date-gt'];
      delete opt['date-let'];
      opt['date-get']=moment(date).format("YYYY-MM-DD");
      opt['date-lt']=moment(date).add('1','day').format("YYYY-MM-DD");
    }

    this.dep_user=0;
    this.perte=0;
    this.api.getList('all_stories',opt).then((d:any)=>{
      this.stories=d;
      d.forEach(v=>{
        this.dep_user+=v.amount;
        this.perte+=v.win;
      })
      this.showLoading=false;
    },q=>{
      this.util.handleError(q);
      this.showLoading=false;
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
      //this.perte=d.perte;
    })
  }

  // jeux qui paye le plus
  getScore(){
    this.best_game=[];
    const opt = {
      should_paginate:false,
    };

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
    this.getStories();
    this.getGain();
    this.getPlayers();
    this.getScore();
    setTimeout(() => {
      console.log('Async operation has ended');
      event.target.complete();
    }, 500);
  }
}
