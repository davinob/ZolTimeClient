import { Component,ViewChild,ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController  } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { SearchSettings,UserService, User,Product, Seller } from '../../providers/user-service';
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
  subCategorySelected:string=null;

  selectCategory(catego:any){
    console.log("CATEGO SELECTED:"+catego);
    if (catego==this.categorySelected)
    {
      this.categorySelected=null;
    }
    else
    {
      this.categorySelected=catego;
    }
    this.subCategorySelected=null;

    this.filterPerCategoryAndSubCategory(this.userService.allSellersFiltered);
  }

  selectSubCategory(subCatego:any){
    console.log("Sub CATEGO SELECTED:"+subCatego);
    if (subCatego==this.subCategorySelected)
    {
      this.subCategorySelected=null;
    }
    else
    {
    this.subCategorySelected=subCatego;
    }

    this.filterPerCategoryAndSubCategory(this.userService.allSellersFiltered);
  }




  getSubCategories(catego:any):any[]{
    if (!catego)
    return new Array();
    
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
    this.navCtrl.push('SearchAddressPage');
  }

  public ;

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create('SearchSettingsPage',{},{cssClass:"popOverClass"});

    popover.present({
      ev: myEvent
    });
  }
  

  getFilteredSellersProdsAndDeals(){
   this.userService.filterSellersAndGetTheirProdsAndDeals(this.userService.userSearchSettings);
  }

  getOrganizedSellers():Array<any>{
    if (!this.userService.userSearchSettings.onlyShowPromotion)
    return this.sellersFiltered;

    return this.sellersFiltered.filter((seller)=>
    {
      return this.shouldShowSeller(seller);
    });
  }

   

  sellersFiltered=new Array();

  filterPerCategoryAndSubCategory(sellers:Array<any>)
  {
    this.sellersFiltered=new Array();

    sellers.forEach((seller,index)=>
    {
      if (seller && seller.products && seller.products.length>0)
      this.sellersFiltered=this.sellersFiltered.concat(Object.assign({}, seller)); 
    });
  
    console.log(this.sellersFiltered);

    if (!this.categorySelected)
    return;

   
    
    this.sellersFiltered=this.sellersFiltered.filter(seller=>
      {
         return seller.category==this.categorySelected.name;
      });

      if (this.subCategorySelected)
          {

            this. sellersFiltered.forEach((seller,index)=>
          {
            if (seller.products)
            {        
              
              this.sellersFiltered[index].products=seller.products.filter(product=>
            {
              return product.category==this.subCategorySelected;
            });
            }

          });
        }
     return ;

  }


  initPosition():Promise<any>
  {
    console.log("INIT POSITION");
    return this.geolocation.getCurrentPosition().then((resp) => {
      this.userService.userSearchSettings.position=this.addressService.createPosition(resp.coords.latitude,resp.coords.longitude,"Current Location");
    
     }).catch((error) => {
      this.alertService.showToast({message:"Error getting location"});
    });
  }
  
  initSearchSettingsFromStorage() {
    

    this.storage.get("settings").then(val => {
      if (val)
      {
       this.userService.userSearchSettings.hashgaha=val.hashgaha;
       this.userService.userSearchSettings.onlyShowPromotion=val.onlyShowPromotion;
       this.userService.userSearchSettings.range=val.range;
      }
        console.log(this.userService.userSearchSettings);
     });

  
  }

  shouldShowSeller(seller:Seller):boolean
  {
    return !this.userService.userSearchSettings.onlyShowPromotion || seller.hasAtLeastOnePromo;
  }
  
  ionViewDidLoad()
  {
    this.initSearchSettingsFromStorage();

    this.userService.doneLookingForSellers.subscribe(doneLookingForSellers=>
      { 
        console.log("DONE LOOKING SELLERS");
        console.log(doneLookingForSellers);
        console.log(this.userService.allSellersFiltered);
        
        if (doneLookingForSellers)
        this.filterSellersAndGetTheirProdsAndProms();

      });

    this.userService.lookingForProducts.subscribe(isLookingforProds=>
      {
     
        if  (isLookingforProds)
        {
        this.alertService.showLoading();
        }
        else
        {
          this.alertService.dismissLoading();
          this.filterPerCategoryAndSubCategory(this.userService.allSellersFiltered);
        }
      });

      

  }

  getSellerProducts(seller:Seller):Array<Product>
  {
    if (!this.userService.userSearchSettings.onlyShowPromotion)
    return seller.products.filter((val,index)=>{return index<5});

    return seller.products.filter((product)=>
    {
      return product.bestPromo;
    }).filter((val,index)=>{return index<5});
  }

 
  filterSellersNewLocation()
  {
    this.categorySelected=null;
    this.subCategorySelected=null;
    this.filterSellersAndGetTheirProdsAndProms();
  }

    
  filterSellersAndGetTheirProdsAndProms()
  {
    console.log(this.userService.userSearchSettings);
    console.log("GETTING SELLERS");
    if ((this.userService.userSearchSettings.position.geoPoint==null)&&((this.userService.userSearchSettings.position.description=="Current Location")||(this.userService.userSearchSettings.position.description=="")))
  {
    this.initPosition().then(val=>{this.getFilteredSellersProdsAndDeals()});
    this.userService.userSearchSettings.position.description="Current Location";
  }
  else
    this.getFilteredSellersProdsAndDeals();
}




goToSeller(seller:Seller)
{
  console.log("GO TO SELLER");
  this.navCtrl.push("SellerPage",{seller:seller});
}
  

 
 
  



    
  

}
