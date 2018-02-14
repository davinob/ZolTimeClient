import { Component,ViewChild,ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController  } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { UserService, User,Product } from '../../providers/user-service';
import { AlertAndLoadingService } from '../../providers/alert-loading-service';

import { Camera,CameraOptions  } from '@ionic-native/camera';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';

import { Geolocation } from '@ionic-native/geolocation';

import 'rxjs/Rx';
/**
 * Generated class for the ProductsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-products',
  templateUrl: 'products.html',
})
export class ProductsPage {


  allInputsShows:any={};
  @ViewChild('promotionStartTime') promotionStartTime;
  @ViewChild('promotionEndTime') promotionEndTime;
  @ViewChild('fileInput') fileInput;
  @ViewChild('selectPictureType') selectPictureType;

  
    
  
  

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private userService:UserService, public alertAndLoadingService: AlertAndLoadingService
    , public formBuilder: FormBuilder,
   private elRef:ElementRef,
    public alertService: AlertAndLoadingService,
    private geolocation: Geolocation ) {
     
  }


products;
positionCords=null;


getLoadedProducts(){

  return this.products;
}
  
  initProducts()
  {
    console.log("GETTING PRODUCTS");
    if (this.positionCords==null)
    return;
    
    this.products=this.userService.getClosestCurrentProducts(this.positionCords.coords.latitude,this.positionCords.coords.longitude);
     console.log("INIT PRODCTS");
     console.log(this.products);
  }

  initPosition():Promise<any>
  {
    return this.geolocation.getCurrentPosition().then((resp) => {
      this.positionCords=resp;
     }).catch((error) => {
      this.alertService.showToast({message:"Error getting location"});
    });
  }
  

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProductsPage');
    this.initPosition().then( val=> {
       this.initProducts();
  });
  }



 
  



    
  

}
