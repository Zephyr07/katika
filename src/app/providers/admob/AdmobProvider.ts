import {Injectable} from '@angular/core';
import {
  AdLoadInfo,
  AdMob, AdmobConsentStatus, AdMobRewardItem,
  AdOptions,
  BannerAdOptions,
  BannerAdPosition,
  BannerAdSize,
  RewardAdOptions, RewardAdPluginEvents
} from '@capacitor-community/admob';
import {Platform} from "@ionic/angular";
import {ApiProvider} from "../api/api";


@Injectable()
export class AdmobProvider {
  interstitialId="";
  rewardId="";
  bannerId="";

  pub=false;


  private is_testing=true;

  constructor(
    private platform :Platform,
    private api : ApiProvider
  ) {

    //this.initialize();

  }

  async initialize(){

    this.setId();

    await AdMob.initialize();
    await AdMob.requestTrackingAuthorization();

    const [trackingInfo, consentInfo] = await Promise.all([
      AdMob.trackingAuthorizationStatus(),
      AdMob.requestConsentInfo(),
    ]);

    if (trackingInfo.status === 'notDetermined') {
      /**
       * If you want to explain TrackingAuthorization before showing the iOS dialog,
       * you can show the modal here.
       * ex)
       * const modal = await this.modalCtrl.create({
       *   component: RequestTrackingPage,
       * });
       * await modal.present();
       * await modal.onDidDismiss();  // Wait for close modal
       **/

      await AdMob.requestTrackingAuthorization();
    }

    const authorizationStatus = await AdMob.trackingAuthorizationStatus();
    if (
      authorizationStatus.status === 'authorized' &&
      consentInfo.isConsentFormAvailable &&
      consentInfo.status === AdmobConsentStatus.REQUIRED
    ) {
      await AdMob.showConsentForm();
    } else {
      await AdMob.resetConsentInfo();
      await AdMob.requestConsentInfo()
    }
  }

  async showBanner(position,margin){
    if(position=='top'){
      position = BannerAdPosition.TOP_CENTER
    } else {
      position = BannerAdPosition.BOTTOM_CENTER
    }
    const options : BannerAdOptions = {
      adId:this.bannerId,
      adSize:BannerAdSize.BANNER,
      position,
      margin,
      //isTesting:true
      isTesting:this.is_testing
    };

    await AdMob.showBanner(options).then(d=>{
      //console.log("Banner Ad Show");
    }).catch(e=>{
      console.log(e);
      console.log(e.message);
    })

  }

  async hideBanner(){
    await AdMob.hideBanner().then(e=>{
      //console.log("hide")
    });
  }

  async removeBanner(){
    await AdMob.removeBanner()

  }

  async loadInterstitial(){
    const opt : AdOptions={
      adId:this.interstitialId,
      isTesting:this.is_testing
      //isTesting:true ca-app-pub-2538027924721849/2426920344 3940256099942544/1033173712
    };

    await AdMob.prepareInterstitial(opt).then(d=>{
      console.log("Prepare pub ok");
    }).catch(e=>{
      console.log(e);
      console.log(e.message);
    });
  }

  async showInterstitial(){
    console.log(this.pub)
    if(this.pub){
      await AdMob.showInterstitial().then(d=>{
        //console.log("Show");
      }).catch(e=> {
        console.log(e);
        console.log(e.message);
      })
    }
  }


  async showRewardVideo2(){
    if(this.pub){
      AdMob.addListener(RewardAdPluginEvents.Rewarded,(reward:AdMobRewardItem)=>{
        //console.log('Reward: ', reward);
      });

      const options: RewardAdOptions ={
        adId:'ca-app-pub-3940256099942544/5224354917',
        isTesting:this.is_testing
      }

      await AdMob.prepareRewardVideoAd(options).then(d=>{
        //console.log("Prepare V");
      }).catch(e=> {
        console.log(e);
        console.log(e.message);
      });
      await AdMob.showRewardVideoAd().then(d=>{
        //console.log("Show V");
      }).catch(e=> {
        console.log(e);
        console.log(e.message);
      });
    }
  }

  async prepareRewardVideo2(){
    return new Promise(async (resolve,reject)=>{
      if(this.pub){
        const options: RewardAdOptions = {
          adId: this.rewardId,
          isTesting:this.is_testing
          // isTesting: true
          // npa: true
          // ssv: {
          //   userId: "A user ID to send to your SSV"
          //   customData: JSON.stringify({ ...MyCustomData })
          //}
        };
        await AdMob.prepareRewardVideoAd(options).then(d=>{
          resolve(d);
        }, q=>{
          reject(q);
        });
      } else {
        reject({});
      }
    })
  }

  async prepareRewardVideo(){
    if(this.pub){
      AdMob.addListener(RewardAdPluginEvents.Rewarded,(reward:AdMobRewardItem)=>{
        //console.log('Reward: ', reward);
      });

      const options: RewardAdOptions ={
        adId:this.rewardId,
        isTesting:this.is_testing
      }

      await AdMob.prepareRewardVideoAd(options).then(d=>{
        //console.log("Prepare V");
      }).catch(e=> {
        console.log(e);
        console.log(e.message);
      });
    }
  }

  async showRewardVideo(){
    if(this.pub){
      await AdMob.showRewardVideoAd();
    }
  }

  setId(){
    this.api.getSettings().then((d:any)=>{
      if(d){
        this.pub = d.pub == 'enable';
        if(this.pub){
          if(d.is_testing_ad=='true'){
            this.is_testing=true;
            this.interstitialId="ca-app-pub-3940256099942544/1033173712";
            this.rewardId="ca-app-pub-3940256099942544/5224354917";
            this.bannerId="ca-app-pub-3940256099942544/6300978111";
          } else {
            this.is_testing=false;
            if(this.platform.is('ios')){
              this.interstitialId="ca-app-pub-2538027924721849/4428501767";
              this.rewardId="ca-app-pub-2538027924721849/6195426301";
              this.bannerId="ca-app-pub-2538027924721849/3306991788";
            } else {
              this.interstitialId="ca-app-pub-2538027924721849/9967490632";
              this.rewardId="ca-app-pub-2538027924721849/8654408967";
              this.bannerId="ca-app-pub-2538027924721849/5011942778";
            }
          }
        }
      } else {
        this.interstitialId="ca-app-pub-3940256099942544/1033173712";
        this.rewardId="ca-app-pub-3940256099942544/5224354917";
        this.bannerId="ca-app-pub-3940256099942544/6300978111";
      }
    }, q=>{
      this.interstitialId="ca-app-pub-3940256099942544/1033173712";
      this.rewardId="ca-app-pub-3940256099942544/5224354917";
      this.bannerId="ca-app-pub-3940256099942544/6300978111";
    })

  }

}
