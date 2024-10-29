import {Injectable} from '@angular/core';
import {ApiProvider, http} from '../api/api';
import * as _ from 'lodash';
//import {NgxPermissionsService, NgxRolesService} from 'ngx-permissions';
import {NotificationProvider} from "../notification/notification";
import * as moment from 'moment';
import {TranslateService} from "@ngx-translate/core";
import {UtilProvider} from "../util/util";
/*
  Generated class for the AuthProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class AuthProvider {

  public token: string;
  public token_key = 'jwt_token';

  constructor(
    public api: ApiProvider,
    private notif: NotificationProvider,
    private util: UtilProvider,
    private  translate:TranslateService
  ) {
    this.token = localStorage.getItem(this.token_key);
  }

  isLogged(): boolean {
    // //console.log("z");
    return localStorage.getItem(this.token_key) != undefined;
  }

  login(credentials: {email: string, password: string, external_id?:string}) {
    //this.permissionsService.flushPermissions();
    return new Promise((resolve, reject) => {
      let crypt = this.util.encryptAESData(credentials);
      this.api.post('auth/signin',crypt,true)
        .then( (response:any) => {
          const data = this.util.decryptAESData(JSON.stringify(response));
          this.storeSession(data);
          this.setLanguage(data.user);
          let tmp = this.util.encryptAESData(credentials);
          localStorage.setItem('auth_ka',JSON.stringify(tmp));
          //this.save_token(data.user);
          /*angular.forEach(data.userRole, function (value) {
            AclService.attachRole(value)
          });
d
          AclService.setAbilities(data.abilities);
          $auth.setToken(response.data);*/
          resolve(data);
        }, (error)=> {
          const data = this.util.decryptAESData(JSON.stringify(error.response.data));
          // //console.log(error);
          /*if (error.status == 401) {
            var errors = error.data.errors;
            for (var key in errors) {
              if (errors.hasOwnProperty(key)) {
                var txt = errors[key][0];
                for (var i = 1; i < errors[key].length; i++) {
                  txt += "<br>" + errors[key][i];
                }
                key = key.split("_").join(" ");
                ToastApi.error({'msg': txt})
              }
            }
          }*/
          reject(data);
        });
    });

  }

  activate(credentials: {code: number}) {
    //this.permissionsService.flushPermissions();
    return new Promise((resolve, reject) => {
      let crypt = this.util.encryptAESData(credentials);
      this.api.post('auth/activate',crypt,true)
        .then( (response) => {
          const data = this.util.decryptAESData(JSON.stringify(response));
          this.storeSession(data);
          /*angular.forEach(data.userRole, function (value) {
            AclService.attachRole(value)
          });
d
          AclService.setAbilities(data.abilities);
          $auth.setToken(response.data);*/
          resolve(data);
        }, function(error) {
          // //console.log(error);
          /*if (error.status == 401) {
            var errors = error.data.errors;
            for (var key in errors) {
              if (errors.hasOwnProperty(key)) {
                var txt = errors[key][0];
                for (var i = 1; i < errors[key].length; i++) {
                  txt += "<br>" + errors[key][i];
                }
                key = key.split("_").join(" ");
                ToastApi.error({'msg': txt})
              }
            }
          }*/
          reject(error);
        });
    });

  }
  delete(credentials: { password: string, email:string}) {
    //this.permissionsService.flushPermissions();
    return new Promise((resolve, reject) => {
      let crypt = this.util.encryptAESData(credentials);
      this.api.post('auth/delete',crypt,true)
        .then( (response) => {
          this.logout();
          /*angular.forEach(data.userRole, function (value) {
            AclService.attachRole(value)
          });
d
          AclService.setAbilities(data.abilities);
          $auth.setToken(response.data);*/
          resolve(true);
        }, function(error) {
          // //console.log(error);
          /*if (error.status == 401) {
            var errors = error.data.errors;
            for (var key in errors) {
              if (errors.hasOwnProperty(key)) {
                var txt = errors[key][0];
                for (var i = 1; i < errors[key].length; i++) {
                  txt += "<br>" + errors[key][i];
                }
                key = key.split("_").join(" ");
                ToastApi.error({'msg': txt})
              }
            }
          }*/
          reject(error);
        });
    });

  }
  register(credentials: {full_name?: string,user_name?:string,store_code?:string, phone: number, email: string, password: string, password_confirmation:string, country_id?:number,
    settings?:any, onesignal_id?:string, promo_code_id?:number}) {
    return new Promise((resolve, reject) => {
      let crypt = this.util.encryptAESData(credentials);
      this.api.post('auth/signup',crypt,true)
        .then( (response) => {
          const data = this.util.decryptAESData(JSON.stringify(response));
          /*localStorage.setItem(this.token_key, data.token);
          localStorage.setItem('user', data.user);*/
          this.storeSession(data);
          this.setLanguage(data.user);
          let tmp = this.util.encryptAESData({email:credentials.phone,password:credentials.password});
          localStorage.setItem('auth_ka',JSON.stringify(tmp));

          resolve(data);
        }, (error) =>{
          // //console.log(error);
          const data = this.util.decryptAESData(JSON.stringify(error.response.data));

          reject(data);
        });
    });

  }

  setLanguage(user){
    if(user.settings!=undefined && user.settings!=""){
      user.settings=JSON.parse(user.settings);
      user.settings.forEach(v=>{
        if(v.language!=undefined){
          moment.locale(v.language);
          this.translate.use(v.language);
        }
      })
    }
  }

  save_token(user) {

    return new Promise((resolve, reject) => {
      this.notif.getDeviceToken().then((token) => {
        if (Array.isArray(user.device_tokens)) {
          if (_.indexOf(user.device_tokens, token) < 0) {
            user.device_tokens.push(token);
          }
        } else {
          user.device_tokens = [token];
        }
        this.update_info(user);
        resolve(user);
      }, (err) => {
        reject(err);
        //console.log(err);
      });
    });

  }

  update_info(credentials: {
    id: number, phone?: string, email?: string,user_name?:string,full_name?:string,
    password: string, point?:number, device_tokens?: string[]
  }) {
    return new Promise((resolve, reject) => {
      let crypt = this.util.encryptAESData(credentials);
      this.api.post('auth/update_info',crypt,true)
        .then((response) => {
          const data = this.util.decryptAESData(JSON.stringify(response));
          //localStorage.setItem(this.token_key, JSON.stringify(data.token));
          localStorage.setItem('user_ka', JSON.stringify(data.user));

          resolve(data);
        }, function(error) {
          // //console.log(error);

          reject(error);
        });
    });

  }

  update_point(credentials: {
    id: number, phone: number, email: string, point:number}) {
    return new Promise((resolve, reject) => {
      let crypt = this.util.encryptAESData(credentials);
      this.api.post('auth/update_point',crypt,true)
        .then((response:any) => {
          const data = response.data;
          resolve(data);
        }, function(error) {
          // //console.log(error);

          reject(error);
        });
    });

  }



  logout() {
    return   new Promise((resolve, reject) => {
      localStorage.removeItem(this.token_key);
      http.defaults.headers['Authorization'] = "Bearer ";
      localStorage.removeItem('user_ka');
      localStorage.removeItem('auth_ka');
      localStorage.setItem('is_user','false');
      ////console.log(localStorage.getItem('user'));
      resolve(true);
      // AclService.flushRoles();
      // AclService.setAbilities({});
    });
  }

  getContext() {
    return   new Promise((resolve, reject) => {
      if (this.isLogged()) {
        resolve(localStorage.getItem('user_ka'));

      } else {
        reject('not logged');
      }
    });
  }

  loadPermissions() {
    /*this.api.me.get().subscribe((data) => {
      this.storeSession(data.body.data);
    }, q => {
      if (q.data.status_code === 500) {
        Metro.notify.create('loadPermissions ' + JSON.stringify(q.data.error.message), 'Erreur ' + q.data.status_code, {cls: 'alert', keepOpen: true, width: 500});
      } else if (q.data.status_code === 401) {

      } else {
        Metro.notify.create('loadPermissions ' + JSON.stringify(q.data.error.errors), 'Erreur ' + q.data.status_code, {cls: 'alert', keepOpen: true, width: 500});
      }
    });*/

  }

  private storeSession(data: any) {
    data.user.subscription_status=this.api.checkSubscription(data.user.subscription);
    http.defaults.headers['Authorization'] = "Bearer "+data.token;
    localStorage.setItem(this.token_key, data.token);
    localStorage.setItem('user_ka', JSON.stringify(data.user));
    /*_.forEach(data.roles, (value) => {
      this.permissionsService.addPermission(value);
    });
    this.rolesService.addRoles(data.roles);*/
  }
}
