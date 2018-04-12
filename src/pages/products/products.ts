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
import { AddressService,Address } from '../../providers/address-service';


import { PopoverController } from 'ionic-angular';
import { SearchSettingsPage, SearchSettings } from '../search-settings/search-settings';
import { TextInput } from 'ionic-angular/components/input/input';
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
  
  @ViewChild('categoriesInput') categoriesInput;
  @ViewChild('hashgahaInput') hashgahaInput;
  @ViewChild('rangeInput') rangeInput;
  

 
  
  categories:string[]=["Italian", "Sandwichs","Israeli", "Boulangerie"];
  
  

  

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private userService:UserService, public alertAndLoadingService: AlertAndLoadingService
    , public formBuilder: FormBuilder,
   private elRef:ElementRef,
    public alertService: AlertAndLoadingService,
    private geolocation: Geolocation,
    public addressService:AddressService,
    public popoverCtrl: PopoverController ) {
     
  }


  goToSearchAddessPage()
  {
    this.navCtrl.push('SearchAddressPage',{position:this.position});
  }

  public settings:SearchSettings={hashgaha:"Any",range:"1 Km",order:"Low Price",onlyShowPromotion:true};

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create('SearchSettingsPage',{settings:this.settings},{cssClass:"popOverClass"});

    popover.present({
      ev: myEvent
    });
  }
  
  


products;

public position=
{lon:null,
  lat:null,
  description:""
};




getLoadedProducts(){
  
  return this.products;
}
  
  initProducts()
  {
    console.log(this.settings);
    console.log("GETTING PRODUCTS");
    if (this.position.lon==null)
    return;
    
    this.products=this.userService.getClosestCurrentProducts(this.position.lat,this.position.lon);
     console.log("INIT PRODCTS");
     console.log(this.products);
  }

  initPosition():Promise<any>
  {
    return this.geolocation.getCurrentPosition().then((resp) => {
      this.position.lat=resp.coords.latitude;
      this.position.lon=resp.coords.longitude;
     

     }).catch((error) => {
      this.alertService.showToast({message:"Error getting location"});
    });
  }
  
  ionViewDidEnter()
  {
    console.log('ionViewDidEnter ProductsPage');
    if (this.position.description=="")
    {
    this.initPosition().then( val=> {
       this.initProducts();
    });
    this.position.description="Current Location";
    }

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProductsPage');

   
  }




  

 
 
  



    
  

}
