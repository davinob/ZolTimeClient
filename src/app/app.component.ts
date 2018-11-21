import { Component, ViewChild } from '@angular/core';
import { Nav, Platform} from 'ionic-angular';


import { UserService } from '../providers/user-service';

import { Storage } from '@ionic/storage';


import { first } from 'rxjs/operators';

 
import { FcmService } from '../providers/fcm-service';
import { ToastController } from 'ionic-angular/components/toast/toast-controller';

import { SplashScreen } from '@ionic-native/splash-screen';
import { timer } from 'rxjs';
import { AlertAndLoadingService } from '../providers/alert-loading-service';


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  activePage: any;
  initTime:boolean=true;
  
  pages: Array<{title: string, component: any, icon: string}>=[
  { title: 'חיפוש', component: 'ProductsPage', icon:'search' },
  { title: 'מועדפים', component: 'FavoritesPage', icon:'star' },
  
  ];
  

  constructor(public platform: Platform, 
    public userService: UserService,
  private storage: Storage, public fcm: FcmService, 
  public toastCtrl: ToastController, public splashScreen:SplashScreen, public alertSvc:AlertAndLoadingService ) {

    this.initApp();
  }

  async initApp(){


    if (this.initTime)
  {
    await this.userService.getAllSellers();
    console.log("REDIRECTING TO SIGNED PAGE");

    let stillWaiting=true;
    let cameFromNotif=false;

    try{

    this.fcm.getToken();

   

    let firstNotifPrmise=this.fcm.listenToNotifications().pipe(first()).toPromise().then(notif=>
      {
      if (stillWaiting)
      {
        this.transferToPageWithNotif(notif);
        cameFromNotif=true;
      }

      });

   
    
    

    let promiseWait = new Promise((resolve, reject) => {
    let wait = setTimeout(() => {
        clearTimeout(wait);
        resolve('Promise A win!');
      }, 1000)
    });

    await Promise.race([
      promiseWait,
      firstNotifPrmise
    ]);
    


  }
  catch(error)
{
  console.log(error);
}
stillWaiting=false;

    if (!cameFromNotif)
    {
      let viewed=await this.storage.get('tutoViewed');
   
      console.log("VALUE");
      console.log(viewed);
      if(!viewed)
     {
      this.nav.setRoot('TutorialPage');
      }
      else
      {
        this.nav.setRoot('ProductsPage');
      }
    }

    
    


   await this.platform.ready();

   
      this.splashScreen.hide();
    

  
      // Get a FCM token
     try{

      
      if ( this.fcm.listenToNotifications()) // Listen to incoming messages
        {                   
          this.fcm.listenToNotifications().subscribe((notif)=>this.transferToPageWithNotif(notif));
        }
      
      }
      catch(error)
      {
        console.log(error);
      }

    }


      this.initTime=false;
      this.activePage=this.pages[0]; 
      

  }

 
  transferToPageWithNotif(notif)
  {
    
      console.log("THE NOTIF");
      console.log(notif);

      if(notif.tap){
        console.log("Received in background");
        if (notif.key)
        {
          this.nav.setRoot("SellerPage",{sellerKey:notif.key});
        
          return;
        }

      } else {
        console.log("Received in foreground");
         // this.alertSvc.presentToast({message:notif.body});
      }

  }



  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
    this.activePage=page;
  }
  
  checkActive(page)
  {
    return page == this.activePage;
  }

 
  
}
