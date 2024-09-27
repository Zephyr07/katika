import {Injectable} from '@angular/core';
import {
  AlertController,
  LoadingController,
  ModalController,
  NavController,
  Platform,
  ToastController
} from '@ionic/angular';
import {RouteProvider} from "./route";
import {Router} from "@angular/router";
import {TranslateService} from "@ngx-translate/core";
import * as CryptoJS from 'crypto-js';
import {CryptoJSAesJson, IV, KEY} from "../../services/contants";
import {Photo} from "@capacitor/camera";
import {Filesystem} from "@capacitor/filesystem";
import * as moment from "moment";
import jsPDF from 'jspdf'
import {File} from '@awesome-cordova-plugins/file';
import {FileOpener} from '@awesome-cordova-plugins/file-opener';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

/*const pdfMakeX = require('pdfmake/build/pdfmake.js');
const pdfFontsX = require('pdfmake-unicode/dist/pdfmake-unicode;js');
pdfMakeX.vfs = pdfFontsX.pdfMake.vfs;*/
import * as pdfMake from "pdfmake/build/pdfmake";
import {Network, NetworkStatus} from "@capacitor/network";

(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;

@Injectable()
export class UtilProvider {
  public date_format = 'Y-M-D';
  public position:any={};
  public autoplay_val = 5000;
  public slide_speed = 700;
  public load: any;

  pdfObj:any;

  CANCEL="";
  TEXT="";
  CONTACT="";
  DELETE="";
  YES="";
  NO="";
  CONNECT="";
  DELETE_TITLE="";

  NOT_LOGGED_TITLE="";
  NOT_LOGGED_CONTENT="";
  SIGNIN="";

  constructor(
    public toastController: ToastController,
    public alertController: AlertController,
    public modalController: ModalController,
    public loadingController: LoadingController,
    private router: Router,
    private route: RouteProvider,
    public navCtrl: NavController,
    private plt: Platform,
    private translate:TranslateService
  ) {
    this.translate.get('yes').subscribe( (res: string) => {
      this.YES=res;
    });
    this.translate.get('no').subscribe( (res: string) => {
      this.NO=res;
    });
    this.translate.get('close').subscribe( (res: string) => {
      this.CANCEL=res;
    });
    this.translate.get('help_for_contact').subscribe( (res: string) => {
      this.TEXT=res;
    });
    this.translate.get('delete_title').subscribe( (res: string) => {
      this.DELETE_TITLE=res;
    });
    this.translate.get('contact_me').subscribe( (res: string) => {
      this.CONTACT=res;
    });
    this.translate.get('deleted').subscribe( (res: string) => {
      this.DELETE=res;
    });
    this.translate.get('login').subscribe( (res: string) => {
      this.CONNECT=res;
    });
    this.translate.get('not_logged_title').subscribe( (res: string) => {
      this.NOT_LOGGED_TITLE=res;
    });
    this.translate.get('not_logged_content').subscribe( (res: string) => {
      this.NOT_LOGGED_CONTENT=res;
    });
    this.translate.get('signin').subscribe( (res: string) => {
      this.SIGNIN=res;
    });
  }

  formarPrice(price) {
    if (price === undefined) {
      return '';
    } else {
      price += '';
      const tab = price.split('');
      let p = '';
      for (let i = tab.length; i > 0; i--) {
        if (i % 3 === 0) {
          p += ' ';
        }
        p += tab[tab.length - i];
      }
      return p;
    }
  }

  async doToast(text, time, color?,pos?:'top' | 'middle' | 'bottom'){
    let p:'top' | 'middle' | 'bottom' = "bottom";
    if(pos){
      p=pos;
    }
    this.translate.get(text).subscribe(async (res: string) => {
      if (color == undefined) {
        color = 'primary';
      }
      const toast = await this.toastController.create({
        message: res,
        color,
        position: p,
        duration: time
      });
      toast.present();
    }, q=>{
      //console.log(q);
    });

  }

  async showLoading(text) {
    this.translate.get(text).subscribe(async (res: string) => {
      this.load = await this.loadingController.create({
        //cssClass: 'my-custom-class',
        message: res
      });
      await this.load.present();

      setTimeout(()=>{
        if(this.load){
          this.load.dismiss();
        }
      },10000);
    }, q=>{
      //console.log(q);
    })
  }

  async hideLoading(){
    if(this.load){
      this.load.dismiss();
      const { role, data } = await this.load.onDidDismiss();
    }
  }

  async handleError(q, next?){
    const status = await Network.getStatus();
    if(!status.connected){
      this.doToast("Vous devez être connecté à internet pour pouvoir continuer",'3000','light','top');
    } else {
      console.log(JSON.stringify(q),q);
      if(q.response){
        q=q.response;
      }
      if(q.data.ct){
        // crypté
        q.data = this.decryptAESData(JSON.stringify(q.data));
      }
      if (q.data.status_code === 401) {
        if(q.data.errors.message[0]=="These credentials do not match our records."){
          this.doToast('bad_credential',3000,'danger');
        } else {
          this.doToast('Vous n\'êtes pas connecté',3000);
        }
        localStorage.setItem('user_taxi_driver',undefined);
        /*if(next){
          this.presentToastWithOptions(next);
        }*/
      } else if(q.status === 401){
        this.doToast('bad_credential',3000);
      } else if (q.status === 422) {
        let message = "";
        for(let i in q.data.errors){
          message+=""+q.data.errors[i][0]+", ";
        }
        this.doToast(message,5000, 'light');
      } else if (q.error) {
        this.doToast(q.error,3000, 'light');
      } else {
        //alert(JSON.stringify(q.data));
        if(q.data.error && q.data.error.message){
          this.doToast(JSON.stringify(q.data.error.message)+ '\n Erreurs ' + q.data.error.status_code,5000);
        } else {
          this.doToast(JSON.stringify(q.data.message)+ '\n Erreur ',5000 , 'light');
        }
        //this.hideLoading();
      }
    }

  }

  async presentToastWithOptions(text,next,time?,button_text?) {
    this.translate.get(text).subscribe(async (res: string) => {
      let button = this.CONNECT;
      if(button_text){
        button = button_text
      }
      const toast = await this.toastController.create({
        message: res,
        //position: 'top',
        color: 'secondary',
        duration: time,
        buttons: [
          {
            //cssClass:"buttonToast",
            text: button,
            role: 'cancel',
            handler: () => {
              // redirection vers next
              this.navCtrl.navigateRoot( next);
            }
          }
        ]
      });
      toast.present();
    }, q=>{
      //console.log(q);
    })

  }

  /*async openSearchModal() {
    const modal = await this.modalController.create({
      component: ModalSearchComponent,
      //cssClass: 'my-custom-class'
    });
    return await modal.present();
  }*/

  capitalize(str){
    if(str!=null){
      return str.charAt(0).toUpperCase() + str.slice(1);
    } else {
      return str;
    }
  }

  async presentAlertPrompt(url:string, state:any) {
    const alert = await this.alertController.create({
      //cssClass: 'my-custom-class',
      header: 'Connectez-vous',
      inputs: [
        {
          name: 'email',
          type: 'email',
          placeholder: 'Email'
        },
        {
          name: 'password',
          type: 'password',
          placeholder: 'Mot de passe',
          //cssClass: 'specialClass',
          attributes: {
            maxlength: 6,
            inputmode: 'decimal'
          }
        }
      ],
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          //cssClass: 'secondary',
          handler: () => {
            //console.log('Confirm Cancel');
          }
        }, {
          text: 'Connexion',
          handler: (data:any) => {
            //console.log('Confirm Ok', data);
            if(data.email!="" && data.password!=""){
              // connexion

              //redirection
              this.route.routeToProduct(state);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async loginModal(){
    this.showModal(this.NOT_LOGGED_TITLE, this.NOT_LOGGED_CONTENT, this.SIGNIN, 'login')
  }

  async showModal(title,message, buttonText, next) {
    const alert = await this.alertController.create({
      //cssClass: 'my-custom-class',
      header: title,
      message: message,
      buttons: [
        {
          text: this.CANCEL,
          role: 'cancel',
          handler: (blah) => {

          }
        },
        {
          text: buttonText,
          role: 'confirm',
          handler: (blah) => {
            this.navCtrl.navigateRoot( next);
          }
        }
      ]
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    //console.log('onDidDismiss resolved with role', role);
  }

  handleData(c,state){
    localStorage.setItem('recent_place',JSON.stringify(c));
    this.navCtrl.navigateRoot(['/tabs']);
    if(state){
      console.log("recent places loaded");
    } else {
      console.log("recent places loaded without GPS");
    }
    return false;
  }

  rad(x) {
    return x * Math.PI / 180;
  }

  distance(p1, p2) {
    let R = 6378137; // Earth’s mean radius in meter
    let dLat = this.rad(p2.lat - p1.lat);
    let dLong = this.rad(p2.lng - p1.lng);
    let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.rad(p1.lat)) * Math.cos(this.rad(p2.lat)) *
      Math.sin(dLong / 2) * Math.sin(dLong / 2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    let d = R * c;

    return d; // returns the distance in meter
  }

  getCoords(){
    /*Geolocation.getCurrentPosition().then((resp) => {
      //console.log('coordonnées ok');
      this.position={lat:resp.coords.latitude,lng:resp.coords.longitude};
      localStorage.setItem('position',JSON.stringify({lat:resp.coords.latitude,lng:resp.coords.longitude}));
    }).catch((error) => {
      ////console.log('Error getting location', error);
    });*/
  }

  formatCategory(cat){
    let x = '';
    let i = 1;
    cat.forEach(v=>{
      x+=v.category.name;
      i++;
      if(i<=cat.length){
        x+=' / '
      }
    });

    return x;
  }

  avgRating(ratings){
    if(ratings.length==0){
      return 0;
    } else {
      let i=0;
      ratings.forEach(v=>{
        i+=v.rating;
      });
      return i/ratings.length;
    }
  }

  async deleteItem(i, item, state, call) {
    // ask for delete
    const alert = await this.alertController.create({
      //cssClass: 'my-custom-class',
      message: this.DELETE_TITLE,
      buttons: [
        {
          text: this.NO,
          role: 'cancel',
          handler: (blah) => {

          }
        },
        {
          text: this.YES,
          role: 'confirm',
          handler: (blah) => {
            this.showLoading('deleting');
            i.remove().subscribe((a: any) => {
              this.hideLoading();
              let texte = item;
              if (i.name) {
                texte += ' ' + i.name + " " + this.DELETE;
              } else {
                texte += ' ' + i.title + " " + this.DELETE
              }

              if (state) {
                texte += "e"
              }
              this.doToast(texte, 3000);
              call;
            }, q => {
              this.hideLoading();
              this.handleError(q)
            })
          }
        }
      ]
    });
    await alert.present();

  }

  async contact() {
    const alert = await this.alertController.create({
      header: this.TEXT,
      subHeader:this.CONTACT,
      buttons: [
        {
          text: this.CANCEL,
          role: 'cancel',
        }
      ]
    });

    await alert.present();
  }

  encryptAESData(data:any){
    return CryptoJS.AES.encrypt(JSON.stringify(data), KEY, {format: CryptoJSAesJson}).toString();
  }

  decryptAESData(text:string){
    //console.log("text : ",text);
    return JSON.parse(CryptoJS.AES.decrypt(text, KEY, {format: CryptoJSAesJson}).toString(CryptoJS.enc.Utf8));
  }

  public async readAsBase64(photo: Photo) {
    if (this.plt.is('hybrid')) {
      const file = await Filesystem.readFile({
        path: photo.path
      });

      return file.data;
    }
    else {
      // Fetch the photo, read as a blob, then convert to base64 format
      const response = await fetch(photo.webPath);
      const blob = await response.blob();

      return await this.convertBlobToBase64(blob) as string;
    }
  }

// Helper function
  convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader;
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });

  about_dev(){
    this.doToast("Cette application a été developpée par EGOFISANCE S.A.R.L | " +
      "\n Chef de projet : Edward NANDA - edward.nanda@egofisance.com",
      5000,'primary','middle');
  }

  printEncaissement(bill:any,user:any) {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [80, 100 + (bill.product_bills.length * 3)]
    });
    //console.log(doc.getFontList());
    //alert(JSON.stringify(doc.getFontList()));
    //doc.setFont('Courier','bold',12);
    //doc.setFont('','bold',12);
    doc.setFontSize(12);
    doc.text(user.store.name.trim(), 6, 10);
    doc.setFontSize(8);
    doc.text(user.store.address.trim(), 6, 15);

    doc.text('Tél: '+this.formarPrice(user.store.phone), 6, 18);
    doc.text(user.store.rccm+"|"+user.store.niu, 6, 21);
    // info sur le vendeur
    doc.text('Encaissé le : ' + moment(bill.created_at).utcOffset(1).format('YYYY-MM-DD HH:mm:ss'), 6, 28);
    doc.text('Imprimé le : ' + moment(new Date()).utcOffset(1).format('YYYY-MM-DD HH:mm:ss'), 6, 31);
    doc.setFontSize(10);
    // Client vendeur
    doc.text('Reçu #' + bill.id, 6, 37);
    doc.setFontSize(8);
    doc.text('Client: ' + bill.customer.full_name.toUpperCase(), 6, 40);
    doc.setFontSize(8);
    doc.text('Vendeur: ' + bill.user.user_name.toUpperCase(), 6, 43);

    doc.text('Produit(s) ', 6, 49);
    doc.text('Qté   Nom      Prix Total ', 6, 52);
    let x = 55;
    let a = 0;
    bill.product_bills.forEach((v, k) => {
      let espace = "      ";
      if(v.quantity>9){
        espace ="     ";
      } else {

      }
      doc.text(v.quantity+espace+v.name+'          '+this.formarPrice(v.price_was*v.quantity)+' FCFA', 6, x);
      a += (v.price_was*v.quantity);
      x += 3;
    });
    x+=3;
    doc.text('Rémise: ' + this.formarPrice(bill.discount) + ' FCFA', 6, x);
    doc.text('Montant versé: ' + this.formarPrice(bill.amount) + ' FCFA', 6, x+3);
    doc.text('Mode de paiement: ' + bill.payment_method.name, 6, x + 6);
    doc.setFontSize(8);
    doc.text(user.store.welcome_text, 6, x + 13);
    doc.setFontSize(6);
    doc.text('*******************************************************', 6, x + 17);
    doc.text('Reçu imprimé par SMOOTHSALE', 6, x + 20);
    doc.text('Votre application de facturation et de gestion de stock', 6, x + 23);
    doc.text('Email: smoothsalepos@gmail.com', 6, x + 26);

    //let img = new Image();
    //img.src = "assets/icon/logo.png";
    //doc.addImage(img, 'PNG', 6, x + 18, 30, 30);


    doc.save(user.store.name+'_receipt_' + moment(new Date()).utcOffset(1).format('YYMMDDHHmmss') + '.pdf');
  }

  async createPDF() {
    //https://www.youtube.com/watch?v=HUi3VNq9BpQ
    try{
      let docObj=this.getPdfDefination();
      this.pdfObj = pdfMake.createPdf(docObj);



    } catch (e) {
      this.handleError(e);
    }
  }

  downloadPdf(){
    try{
      this.pdfObj.download();
    } catch (e) {
      console.log(e);
    }
  }

  getPdfDefination(){
    let dd = {
      /*pageSize: {
        width: 595.28,
        height: 'auto'
      },*/
      content: [
        {
          text: 'This is a header, using header style',
          style: 'header'
        },
        'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Confectum ponit legam, perferendis nomine miserum, animi. Moveat nesciunt triari naturam.\n\n',
        {
          text: 'Subheader 1 - using subheader style',
          style: 'subheader'
        },
        'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Confectum ponit legam, perferendis nomine miserum, animi. Moveat nesciunt triari naturam posset, eveniunt specie deorsus efficiat sermone instituendarum fuisse veniat, eademque mutat debeo. Delectet plerique protervi diogenem dixerit logikh levius probabo adipiscuntur afficitur, factis magistra inprobitatem aliquo andriam obiecta, religionis, imitarentur studiis quam, clamat intereant vulgo admonitionem operis iudex stabilitas vacillare scriptum nixam, reperiri inveniri maestitiam istius eaque dissentias idcirco gravis, refert suscipiet recte sapiens oportet ipsam terentianus, perpauca sedatio aliena video.',
        'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Confectum ponit legam, perferendis nomine miserum, animi. Moveat nesciunt triari naturam posset, eveniunt specie deorsus efficiat sermone instituendarum fuisse veniat, eademque mutat debeo. Delectet plerique protervi diogenem dixerit logikh levius probabo adipiscuntur afficitur, factis magistra inprobitatem aliquo andriam obiecta, religionis, imitarentur studiis quam, clamat intereant vulgo admonitionem operis iudex stabilitas vacillare scriptum nixam, reperiri inveniri maestitiam istius eaque dissentias idcirco gravis, refert suscipiet recte sapiens oportet ipsam terentianus, perpauca sedatio aliena video.',
        'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Confectum ponit legam, perferendis nomine miserum, animi. Moveat nesciunt triari naturam posset, eveniunt specie deorsus efficiat sermone instituendarum fuisse veniat, eademque mutat debeo. Delectet plerique protervi diogenem dixerit logikh levius probabo adipiscuntur afficitur, factis magistra inprobitatem aliquo andriam obiecta, religionis, imitarentur studiis quam, clamat intereant vulgo admonitionem operis iudex stabilitas vacillare scriptum nixam, reperiri inveniri maestitiam istius eaque dissentias idcirco gravis, refert suscipiet recte sapiens oportet ipsam terentianus, perpauca sedatio aliena video.\n\n',
        {
          text: 'Subheader 2 - using subheader style',
          style: 'subheader'
        },
        'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Confectum ponit legam, perferendis nomine miserum, animi. Moveat nesciunt triari naturam posset, eveniunt specie deorsus efficiat sermone instituendarum fuisse veniat, eademque mutat debeo. Delectet plerique protervi diogenem dixerit logikh levius probabo adipiscuntur afficitur, factis magistra inprobitatem aliquo andriam obiecta, religionis, imitarentur studiis quam, clamat intereant vulgo admonitionem operis iudex stabilitas vacillare scriptum nixam, reperiri inveniri maestitiam istius eaque dissentias idcirco gravis, refert suscipiet recte sapiens oportet ipsam terentianus, perpauca sedatio aliena video.',
        'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Confectum ponit legam, perferendis nomine miserum, animi. Moveat nesciunt triari naturam posset, eveniunt specie deorsus efficiat sermone instituendarum fuisse veniat, eademque mutat debeo. Delectet plerique protervi diogenem dixerit logikh levius probabo adipiscuntur afficitur, factis magistra inprobitatem aliquo andriam obiecta, religionis, imitarentur studiis quam, clamat intereant vulgo admonitionem operis iudex stabilitas vacillare scriptum nixam, reperiri inveniri maestitiam istius eaque dissentias idcirco gravis, refert suscipiet recte sapiens oportet ipsam terentianus, perpauca sedatio aliena video.\n\n',
        {
          text: 'It is possible to apply multiple styles, by passing an array. This paragraph uses two styles: quote and small. When multiple styles are provided, they are evaluated in the specified order which is important in case they define the same properties',
          style: ['quote', 'small']
        }
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true
        },
        subheader: {
          fontSize: 15,
          bold: true
        },
        quote: {
          italics: true
        },
        small: {
          fontSize: 8
        }
      }
    };

    return dd;
  }

  // Helper function to generate random numbers within a range with 2 decimals
  randomInRange(min, max) {
    return parseFloat((Math.random() * (max - min) + min).toFixed(2));
  }

  async initializeNetworkListener() {
    // Vérifier l'état initial du réseau
    const status: NetworkStatus = await Network.getStatus();

    // Écouter les changements de connexion
    Network.addListener('networkStatusChange', (status) => {
      //console.log('Changement de l’état du réseau:', status);

      if (!status.connected) {
        this.doToast('Vous avez perdu la connexion Internet.',1000,'light');
        // Ajoute une notification pour l'utilisateur ici si nécessaire
      } else {
        this.doToast('Connexion Internet restaurée.',1000,'light');
        // Ajoute une notification pour l'utilisateur ici si nécessaire
      }
    });
  }

  randomIntInRange(min, max) {
    return parseInt((Math.random() * (max - min) + min));
  }

  shuffleArray<T>(array: T[]): T[] {
    let currentIndex = array.length, randomIndex;

    // Tant qu'il reste des éléments à mélanger...
    while (currentIndex !== 0) {
      // Choisir un élément restant...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // Et échanger l'élément actuel avec celui aléatoire
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;
  }
}
