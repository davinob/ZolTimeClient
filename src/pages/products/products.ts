import { Component,ViewChild,ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController  } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { SearchSettings,UserService, User,Product } from '../../providers/user-service';
import { AlertAndLoadingService } from '../../providers/alert-loading-service';

import { Camera,CameraOptions  } from '@ionic-native/camera';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';

import { Geolocation } from '@ionic-native/geolocation';

import 'rxjs/Rx';
import { Position,AddressService,Address } from '../../providers/address-service';


import { PopoverController } from 'ionic-angular';
import { SearchSettingsPage } from '../search-settings/search-settings';
import { TextInput } from 'ionic-angular/components/input/input';
import { Storage } from '@ionic/storage';
import { Subscription } from 'rxjs/Subscription';
import { GlobalService } from '../../providers/global-service';
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
    public popoverCtrl: PopoverController,
     public storage:Storage,
    private globalSvc:GlobalService ) {
     
  }



  getCategories()
  {
    return this.globalSvc.categories;
  }

  categorySelected:any=null;
  subCategorySelected:any=null;

  selectCategory(catego:any){
    console.log("CATEGO SELECTED:"+catego);
    this.categorySelected=catego;
    this.subCategorySelected=null;
    this.initSellers();

  }

  selectSubCategory(subCatego:any){
    console.log("Sub CATEGO SELECTED:"+subCatego);
    this.subCategorySelected=subCatego;

    this.initSellers();

  }

  getSubCategories(catego:any):any[]{
    return catego.subCategories;
  }

  isCategorySelected(catego:any):boolean
  {
    return this.categorySelected && catego==this.categorySelected;
  }

  isSubCategorySelected(subCatego:any):boolean
  {
    return this.subCategorySelected && subCatego==this.subCategorySelected;
  }


  goToSearchAddessPage()
  {
    this.navCtrl.push('SearchAddressPage',{position:this.settings.position});
  }

  public settings:SearchSettings={
    position:{geoPoint:null,description:""},
    hashgaha:"Any",
    range:1,
    order:"Low Price",
    onlyShowPromotion:true};

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create('SearchSettingsPage',{settings:this.settings},{cssClass:"popOverClass"});

    popover.present({
      ev: myEvent
    });
  }
  
  

  
  initSellers()
  {
    //this.userService.sellersOrganizedSubject.unsubscribe();

    console.log(this.settings);
    console.log("GETTING SELLERS");
    if ((this.settings.position.geoPoint==null)&&(this.settings.position.description=="Current Location"))
  {
    this.initPosition().then(val=>{this.fetchSellers()});
  }
  else
    this.fetchSellers();
}

  fetchSellers(){
    console.log(this.settings.position);
    
      this.userService.getClosestCurrentSellers(this.settings);
  }

  getOrganizedSellers():Array<any>{
    console.log("ORGANIZED SELLERS");
    console.log(this.userService.allSellersOrganized);
    return this.userService.allSellersOrganized;
  }

  initPosition():Promise<any>
  {
    console.log("INIT POSITION");
    return this.geolocation.getCurrentPosition().then((resp) => {
      this.settings.position=this.addressService.createPosition(resp.coords.latitude,resp.coords.longitude,"Current Position");
    
     }).catch((error) => {
      this.alertService.showToast({message:"Error getting location"});
    });
  }
  
  initSearchSettingsFromStorage() {
    console.log(this.settings);

    this.storage.get("settings").then(val => {
      if (val)
      {
       this.settings.hashgaha=val.hashgaha;
       this.settings.onlyShowPromotion=val.onlyShowPromotion;
       this.settings.order=val.order;
       this.settings.range=val.range;
      }
        console.log(this.settings);
     });

  
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProductsPage');

    this.initSearchSettingsFromStorage();

    if (this.settings.position.description=="")
    {
    this.initPosition().then( val=> {
       this.fetchSellers();
    });
    this.settings.position.description="Current Location";
    }
   
  }




  

 
 
  



    
  

}
