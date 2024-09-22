import {Injectable, Pipe, PipeTransform} from '@angular/core';


@Pipe({
  name: 'status',
})

@Injectable()
export class StatutPipe implements PipeTransform{

  transform(value: any, ...args: any[]): any {
    if (value === 'solvent') {
      return 'Solvable';
    } else if (value === 'insolvent') {
      return 'Créance';
    } else if (value === 'used') {
      return 'Utilisé';
    } else if (value === 'submited') {
      return 'Confirmation utilisateur requise'
    } else if (value === 'failed') {
      return 'Echec'
    } else if (value === 'complete') {
      return 'Validée'
    } else if (value === 'pending_review') {
      return 'En attente de verification';
    } else if (value === 'pending_delivery') {
      return 'En attente de livraison';
    } else if (value === 'pending_confirmation') {
      return 'En attente de validation';
    } else if (value === 'delivered') {
      return 'Livré';
    } else if (value === 'collect') {
      return 'Collect';
    } else if (value === 'shop') {
      return 'Boutique';
    } else if (value === 'paid') {
      return 'Payée';
    } else if (value === 'pending_payment') {
      return 'En attente de paiement';
    } else if (value === 'pending_validation') {
      return 'En attente de validation de la commande';
    } else if (value === 'cancel') {
      return 'Commande annulée';
    } else if (value === 'delivered') {
      return 'Livrée';
    } else if (value === 'unpaid') {
      return 'Non payée';
    } else if (value === 1) {
      return 'Oui';
    } else if (value === 0) {
      return 'Non';
    } else if (value === 'validated') {
      return 'Validé';
    } else if (value === 'pending') {
      return 'En attente';
    } else if (value === 'enable' || value === 'actived' || value === 'active') {
      return 'Activé';
    } else if (value === 'disable') {
      return 'Désactivé';
    } else if (value === 'female') {
      return 'Femme';
    } else if (value === 'male') {
      return 'Homme';
    } else if (value === 'new') {
      return 'Nouveau';
    } else if (value === 'standard') {
      return 'Normal';
    } else if (value === 'before_premiere') {
      return 'Avant première';
    } else if (value === 'premiere') {
      return 'Première';
    } else if (value === 'special') {
      return 'Spécial';
    } else if (value === 'in_process') {
      return 'Encours';
    } else if (value === 'accept') {
      return 'Accepté';
    } else if (value === 'done') {
      return 'Traité';
    } else if (value === 'adult') {
      return 'Adulte';
    } else if (value === 'child') {
      return 'Enfant';
    } else if (value === 2) {
      if(args[0]=='subscription'){
        return 'Paiement en attente';
      }
    } else if (value === 'finish') {
      if(args[0]==0){
        return 'Non valide';
      } else{
        return 'Terminé';
      }
    } else if (value === 'schedule') {
      if(args[0]==0){
        return 'Valide';
      } else{
        return 'Programmé';
      }
    }
  }
}
