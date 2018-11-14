import { Component, ViewChild } from '@angular/core';
import { Nav, Platform} from 'ionic-angular';


import { UserService } from '../providers/user-service';

import { Storage } from '@ionic/storage';
import 'rxjs/add/operator/first';


 
import { FcmService } from '../providers/fcm-service';
import { ToastController } from 'ionic-angular/components/toast/toast-controller';

import { SplashScreen } from '@ionic-native/splash-screen';
import { timer } from 'rxjs';


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  activePage: any;
  initTime:boolean=true;
  
  pages: Array<{title: string, component: any, icon: string}>;

  constructor(public platform: Platform, 
    public userService: UserService,
  private storage: Storage,fcm: FcmService, 
  toastCtrl: ToastController, public splashScreen:SplashScreen ) {
     
   platform.ready().then(()=>{
    console.log(platform);
   //we want to let the splashScren for 5 secs:
    timer(5000).subscribe(bal=>
    {
      this.splashScreen.hide();
    });
      // Get a FCM token
     try{

      fcm.getToken();
      if (fcm.listenToNotifications()) // Listen to incoming messages
        {                   
        fcm.listenToNotifications().subscribe((notif)=>
           {
            console.log(notif);

            if(notif.tap){
              console.log("Received in background");
              if (notif.key)
              {
                this.nav.setRoot("SellerPage",{sellerKey:notif.key});
              }

            } else {
              console.log("Received in foreground");
                 // show a toast
               const toast = toastCtrl.create({
              message: notif.body,
              duration: 10000,
              position: 'top'
              
            });
            toast.present();
            }

         
          });                    
      
        }
      
      }
      catch(error)
      {
        console.log(error);
      }


if (this.initTime)
{
console.log("REDIRECTING TO SIGNED PAGE");

  this.storage.get('tutoViewed').then(
    viewed=>{
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
  ) ;

}

this.initTime=false;



// used for an example of ngFor and navigation
this.pages = [
{ title: 'חיפוש', component: 'ProductsPage', icon:'search' },
{ title: 'מועדפים', component: 'FavoritesPage', icon:'star' },

];

this.activePage=this.pages[0];


this.initializeApp();

   });

              

  }

 


  initializeApp() {
    
      this.platform.ready().then( () => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      console.log("Platform is ready");
       });
  
  
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
