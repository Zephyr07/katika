import {Injectable, Pipe, PipeTransform} from '@angular/core';


@Pipe({
  name: 'dateFormat',
})

@Injectable()
export class DateFormatPipe implements PipeTransform {
  mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aou', 'Sep', 'Oct', 'Nov', 'Déc'];
  transform(value: any, ...args: any[]): any {
    if (value == undefined) {
      return '';
    } else {
      if(args[0]){
        if(args[0]==1){
          const temp = value.split('T');
          const date = temp[0].split('-');
          return date[2] + ' ' + this.mois[parseInt(date[1])-1] + ' ' + date[0] + ' à ' + temp[1].split(".")[0];
        } else if(args[0]=='heure'){
          const temp = value.split('T');
          const heure = temp[1].split(':');
          return heure[0] + ':' + heure[1];
        } else {
          const temp = value.split(' ');
          const date = temp[0].split('-');
          return date[2] + ' ' + this.mois[parseInt(date[1])-1] + ' ' + date[0] + ' à ' + temp[1];
        }
      } else {
        const temp = value.split('T');
        if(temp.length==1){
          const temp = value.split(' ');
          const date = temp[0].split('-');
          return date[2] + ' ' + this.mois[parseInt(date[1])-1] + ' ' + date[0];
        } else {
          const date = temp[0].split('-');
          return date[2] + ' ' + this.mois[parseInt(date[1])-1] + ' ' + date[0];
        }

      }
    }
  }
}
