import { Component, ViewChild } from '@angular/core';
import { Nav, Platform} from 'ionic-angular';


import { ProductsPage } from '../pages/products/products';

import { TutorialPage } from '../pages/tutorial/tutorial';
import { LoginPage } from '../pages/login/login';
import { SearchSettingsPage } from '../pages/search-settings/search-settings';

import { AuthService } from '../providers/auth-service';
import { UserService } from '../providers/user-service';

import { Storage } from '@ionic/storage';
import 'rxjs/add/operator/first';

import { TranslateService } from '@ngx-translate/core';
import { FcmService } from '../providers/fcm-service';
import { ToastController } from 'ionic-angular/components/toast/toast-controller';


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  activePage: any;
  initTime:boolean=true;
  
  pages: Array<{title: string, component: any}>;

  constructor(public translate: TranslateService,public platform: Platform, public authService: AuthService, 
    public userService: UserService,
  private storage: Storage,fcm: FcmService, toastCtrl: ToastController ) {
   


                    // Get a FCM token
                    fcm.getToken()

                    // Listen to incoming messages
                    fcm.listenToNotifications().subscribe(notif=>
                       {
                        // show a toast
                        const toast = toastCtrl.create({
                          message: notif.body,
                          duration: 3000
                        });
                        toast.present();
                      });                    
                    
              


           authService.getAuthState().subscribe(user=>
          {
           
            if (user)
            {
              this.userService.updateUserAuthConnected(true);
              console.log("USER IS NOT CONNECTED");
            }
            else
            {
              this.userService.updateUserAuthConnected(false);
              console.log("USER IS NOT CONNECTED");
            }

          });

           if (this.initTime)
         {
          console.log("REDIRECTING TO SIGNED PAGE")
          
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
      { title: 'Find Products', component: 'ProductsPage' },
      { title: 'Favorites', component: 'FavoritesPage' },
    
    ];
    
    this.activePage=this.pages[0];

    this.initTranslate();

    this.initializeApp();

  }

  initTranslate() {
    // Set the default language for translation strings, and the current language.
    this.translate.setDefaultLang('he');

//    if (this.translate.getBrowserLang() !== undefined) {
  //    this.translate.use(this.translate.getBrowserLang());
    //} else {
      //this.translate.use('he'); // Set your language here
    //}

  }


  
  isUserAuthenticated():boolean
  {
    return this.userService.currentUser!=null && this.userService.currentUser.authenticated;
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
  
  logout()
  {
    this.authService.logoutUser();
  }
  
 
  
}
