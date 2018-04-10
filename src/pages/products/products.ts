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
import { SearchSettingsPage } from '../search-settings/search-settings';
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
  
  
  @ViewChild('address') addressInput ;
  searchAddress: string = '';
  addresses: any;
  shouldShowAddresses:boolean;
  searching:boolean=false;
  addressSelected:boolean=false;
  addressJSON:Address;

  

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private userService:UserService, public alertAndLoadingService: AlertAndLoadingService
    , public formBuilder: FormBuilder,
   private elRef:ElementRef,
    public alertService: AlertAndLoadingService,
    private geolocation: Geolocation,
    public addressService:AddressService,
    public popoverCtrl: PopoverController ) {
     
  }


settings:any={hashgaha:"Any",range:"1 Km"};

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create('SearchSettingsPage',this.settings,{cssClass:"popOverClass"});

    popover.present({
      ev: myEvent
    });
  }


  




    
  showAddresses(toShow:boolean)
  {
   this.shouldShowAddresses=toShow;  
   if (!toShow)
   {
   this.searching=false;
   if (!this.addressSelected)
    this.searchAddress=null;
   }
  }

  lastStringTyped:string="";

  setFilteredItems() {
    console.log("FILTERING ADDRESSES");
    console.log(this.lastStringTyped);
    console.log(this.searchAddress);
    if ((this.searchAddress==null)||(this.searchAddress.length<2)
    ||(this.lastStringTyped==this.searchAddress)||(!this.shouldShowAddresses))
    {
      if ((this.searchAddress==null)||(this.searchAddress.length<2))
        this.addressSelected=false;
      this.addresses=null;
      return;
    }
    this.lastStringTyped=this.searchAddress;
      this.searching=true;
      this.addressSelected=false;
      this.addressService.filterItems(this.searchAddress).first().subscribe((listOfAddresses)=>
      {
         this.searching=false;
         this.addresses=listOfAddresses.value;
      });

  }



  
  
  
  selectAddress(address:any)
  {
    console.log("SELECT ADDRESS" + address.description);
    this.addresses=null;
    this.searchAddress=address.description;
    this.lastStringTyped=this.searchAddress;
    this.addressSelected=true;
    
    
    this.addressService.getPosition(address.place_id).first().subscribe((addressJSON)=>
    {
        console.log(addressJSON);
        this.addressJSON=addressJSON.value;
    });
    
   this.addressInput.setFocus();
    
  }


products;
positionCords=null;


getLoadedProducts(){
  
  return this.products;
}
  
  initProducts()
  {
    console.log(this.settings);
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




  editInput(input:string,bool:boolean)
  {
    this.allInputsShows[input]=bool;
    switch (input) {
      case "categories":
      this.categoriesInput._elementRef.nativeElement.click();
        break;
       case "hashgaha":
      this.hashgahaInput._elementRef.nativeElement.click();
      break;
      case "range":
      this.rangeInput._elementRef.nativeElement.click();
      break;
      case "address":
      if (bool)
        this.addressSelected=false;
        break;
      default:
        break;
    }

  }
 
  



    
  

}
