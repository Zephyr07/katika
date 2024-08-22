import * as CryptoJS from 'crypto-js';

//police : https://fr.textstudio.com/logo/1388/jeu+vid%C3%A9o

//export const API_ENDPOINT = 'http://kt.local/api/';
export const API_ENDPOINT = 'https://katika.warzone237.com/public/api/';
export const ONE_SIGNAL_CONF = {
  "sender_id": '472124460397',
  "app_id": 'a475f23d-3180-48f2-8798-8b8997e3f0b8',
};

export const MOIS = [
  'Janv','Fév','Mars','Avr','Mai','Juin','Juil','Août','Sept','Oct','Nov','Dec'
];

export const FEES = 0.2;
export const DEVISE = "FCFA";
export const COOL_PAY_KEY = "4c704d4e-e2e2-4242-8a0c-68bb703122e4";

// a configurer en fonction du pays
export const NUMBER_RANGE={
  min:620000000,
  max:699999999
};

export const COMMISSION = 20;

export const TOMBOLA_RANGE={
  min:1,
  max:25
};

export const TOMBOLA_FEES=0.1;

export const KEY:string = "zt!(sVEm&P:UnAJq8rc~k]3z9[IL[s32";
export const IV:string = "d3HP)1{bw$d}|,3";

export const CryptoJSAesJson = {
  stringify: function (cipherParams) {
    const vbJsonString = {
      ct: cipherParams.ciphertext.toString(CryptoJS.enc.Base64)
    };
    if (cipherParams.iv) {
      vbJsonString['iv'] = cipherParams.iv.toString()
    }
    if (cipherParams.salt) {
      vbJsonString['s'] = cipherParams.salt.toString()
    }
    return JSON.stringify(vbJsonString);
  },
  parse: function (jsonStr) {
    const vbJsonParse = JSON.parse(jsonStr);
    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Base64.parse(vbJsonParse.ct)
    });
    if (vbJsonParse.iv) {
      cipherParams['iv'] = CryptoJS.enc.Hex.parse(vbJsonParse.iv)
    }
    if (vbJsonParse['s']) {
      cipherParams.salt = CryptoJS.enc.Hex.parse(vbJsonParse.s)
    }
    return cipherParams;
  }
};

export const WHATSAPP_NUMBER = 673996540;
