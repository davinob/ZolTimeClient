import { Component,ViewChild } from '@angular/core';
import { IonicPage, MenuController, NavController, Platform } from 'ionic-angular';

 


import { Storage } from '@ionic/storage';



import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export interface Slide {
  title: string;
  description: string;
  image: string;
}

@IonicPage()
@Component({
  selector: 'page-tutorial',
  templateUrl: 'tutorial.html'
})
export class TutorialPage {
  slides: Slide[];
  showSkip = false;
  dir: string = 'rtl';


  

  constructor(public navCtrl: NavController, 
    public menu: MenuController,
    public platform: Platform,
    public formBuilder: FormBuilder,
    private storage: Storage
    ) 
  {
    
       
        this.slides = [
          {
            title: "TUTORIAL_SLIDE1_TITLE",
            description: "TUTORIAL_SLIDE1_DESCRIPTION",
            image: 'assets/img/ica-slidebox-img-1.png',
          },
          {
            title: "TUTORIAL_SLIDE2_TITLE",
            description: "TUTORIAL_SLIDE2_DESCRIPTION",
            image: 'assets/img/ica-slidebox-img-2.png',
          },
          {
            title: "TUTORIAL_SLIDE3_TITLE",
            description: "TUTORIAL_SLIDE3_DESCRIPTION",
            image: 'assets/img/ica-slidebox-img-3.png',
          }
        ];
  


      
  }


  startApp() {
   this.storage.set('tutoViewed', true);
    this.navCtrl.setRoot('ProductsPage', {}, {
      animate: true,
      direction: 'forward'
    });
  }

  onSlideChangeStart(slider) {
    this.showSkip = false;//!slider.isEnd();
  }

  ionViewDidEnter() {
    // the root left menu should be disabled on the tutorial page
    this.menu.enable(false);
  }

  ionViewWillLeave() {
    // enable the root left menu when leaving the tutorial page
    this.menu.enable(true);
  }

  ionViewDidLoad() {
   
   }


   getURL(url:string)
   {
     return 'url(' + url + ')';
   }


  


  

}
