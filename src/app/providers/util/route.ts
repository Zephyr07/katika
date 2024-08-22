import {Injectable} from '@angular/core';
import {NavigationExtras, Router} from "@angular/router";
@Injectable()
export class RouteProvider {

  constructor( private router: Router ) {

  }

  routeToCagetory(c:any){
    const navigationExtra : NavigationExtras = {state: {category:{'name':c.name, 'id':c.id, type:'categories'}}};
    this.router.navigateByUrl('product-list',navigationExtra);
  }

  routeToBrand(c:any){
    const navigationExtra : NavigationExtras = {state: {brand:{'name':c.name, 'id':c.id, type:c.type}}};
    this.router.navigateByUrl('product-list',navigationExtra);
  }

  routeToSubCagetory(c:any){
    const navigationExtra : NavigationExtras = {state: {category:{'name':c.name, 'id':c.id, type:'categories'}}};
    this.router.navigateByUrl('sub-category-list',navigationExtra);
  }

  routeToPrice(p:any){
    const navigationExtra : NavigationExtras = {state: {offer:{'name':p.name, 'id':p.id}}};
    this.router.navigateByUrl('price',navigationExtra);
  }

  routeToProduct(p:any){
    const navigationExtra : NavigationExtras = {state: {offer:{'name':p.name, 'id':p.id}}};
    this.router.navigateByUrl('product-detail',navigationExtra);
  }

  routeToCompany(company_id:any,link?){
    if(!link){
      link="";
    }
    const navigationExtra : NavigationExtras = {state: {company_id}};
    this.router.navigateByUrl(link+'company-detail',navigationExtra);
  }

  goToEditCompany(company_id:any){
    const navigationExtra : NavigationExtras = {state: {company_id}};
    this.router.navigateByUrl('company-add',navigationExtra);
  }

  routeToSearch(p:any){
    const navigationExtra : NavigationExtras = {state: {search:p}};
    this.router.navigateByUrl('search-page',navigationExtra);
  }

  routeToCompanyAdd(){
    this.router.navigateByUrl('company-add');
  }

  routeToAbout(){
    this.router.navigateByUrl('about');
  }

  routeToFavorite(){
    this.router.navigateByUrl('favorite');
  }

  routeToEditAccount(){
    this.router.navigateByUrl('account-edit');
  }

  routeToSubscription(){
    this.router.navigateByUrl('subscription');
  }

  routeToSuggestion(){
    this.router.navigateByUrl('suggestion');
  }
}
