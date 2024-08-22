import { Component, OnInit } from '@angular/core';
import {ApiProvider} from "../../providers/api/api";
import {UtilProvider} from "../../providers/util/util";
import {Router} from "@angular/router";
import {ModalController} from "@ionic/angular";
import {AuthProvider} from "../../providers/auth/auth";

@Component({
  selector: 'app-modal-edit-user',
  templateUrl: './modal-edit-user.component.html',
  styleUrls: ['./modal-edit-user.component.scss'],
})
export class ModalEditUserComponent implements OnInit {
  user_name = "";
  password = "";
  phone:any;
  user:any;


  constructor(
    private api:ApiProvider,
    private router: Router,
    private util:UtilProvider,
    private auth:AuthProvider,
    private modalController:ModalController
  ) {
    if(this.api.checkUser()){
      this.user=JSON.parse(localStorage.getItem('user_ka'));
      this.user_name=this.user.user_name;
    } else{
      this.router.navigate(['/login']);
    }
  }

  ngOnInit() {
  }

  save(){
    const opt={
      user_name:this.user_name,
      password:this.password,
      current_password:this.password,
      password_confirmation:this.password,
      phone:this.user.phone,
      email:this.user.email,
      id:this.user.id
    };
    this.util.showLoading("saving");

    this.auth.update_info(opt).then((d:any)=>{
      localStorage.setItem('user_ka',JSON.stringify(d.user));
      this.util.hideLoading();
      this.util.doToast('info_updated',3000);
      this.confirm();
    },q=>{
      this.util.hideLoading();
      this.util.handleError(q)
    })
  }

  cancel() {
    return this.modalController.dismiss(null, 'cancel');
  }

  confirm() {
    return this.modalController.dismiss('user_updated', 'confirm');
  }

}
