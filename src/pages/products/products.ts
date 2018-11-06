import { Component,ViewChild,ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController  } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { SearchSettings,UserService, Seller } from '../../providers/user-service';
import { AlertAndLoadingService } from '../../providers/alert-loading-service';

import { Camera,CameraOptions  } from '@ionic-native/camera';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';

import { Geolocation } from '@ionic-native/geolocation';

import 'rxjs/Rx';
import { Position,AddressService,Address } from '../../providers/address-service';

import {Product} from "../../providers/user-service";

import { PopoverController } from 'ionic-angular';
import { SearchSettingsPage } from '../search-settings/search-settings';
import { TextInput } from 'ionic-angular/components/input/input';
import { Storage } from '@ionic/storage';
import { Subscription } from 'rxjs/Subscription';
import { GlobalService } from '../../providers/global-service';

import { CallNumber } from '@ionic-native/call-number';
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
  

 
  wentToSeller:boolean=false;
  noLocationStr:string="NO LOCATION";
  

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private userService:UserService ,
     public formBuilder: FormBuilder,
   private elRef:ElementRef,
    public alertService: AlertAndLoadingService,
    private geolocation: Geolocation,
    public addressService:AddressService,
    public popoverCtrl: PopoverController,
     public storage:Storage,
    private globalSvc:GlobalService,
    private callNumber: CallNumber ) {
      
     
  }

  

callTel(num:string)
{
  this.callNumber.callNumber(num, true);
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

 

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create('SearchSettingsPage',{},{cssClass:"popOverClass"});

    popover.present({
      ev: myEvent
    });
  }
  

  getFilteredSellersProdsAndDeals(){
   this.userService.filterSellersAndGetTheirProdsAndDeals(this.userService.userSearchSettings);
  }


  haveOrganizedSellers():boolean{
  return this.sellersFiltered!=null && this.sellersFiltered.length>0;

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


  async initPosition()
  {
    console.log("INIT POSITION");
    
    try{
    let resp= await this.geolocation.getCurrentPosition();

      console.log("INIT POSITION");
      console.log(resp);
      this.userService.userSearchSettings.position= await this.addressService.createPositionWithCurrentLocation(resp.coords.latitude,resp.coords.longitude);
      console.log("POSITION NEWW");
      console.log(this.userService.userSearchSettings.position);
     }
     catch(error) 
     {
       console.log("ERROR FOR GEOLOCATION");
     this.userService.userSearchSettings.position= await this.addressService.createPosition(0,0,this.noLocationStr);
  
      this.alertService.showToast({message:"Error getting location, please allow geolocation or type address..."});
    }
  }
  
  

  shouldShowSeller(seller:Seller):boolean
  {
  return !this.userService.userSearchSettings.onlyShowPromotion || seller.hasAtLeastOnePromo;
  }


  
  
  ionViewDidEnter()
  {
    console.log("ION VIEW DID ENTER");
    console.log(this.wentToSeller);
    if (this.userService.doneLookingForSellersCompleteValue && !this.wentToSeller)//so we've been there at least once, sellers are already ready
    {
      this.filterSellersAndGetTheirProdsAndProms();
    }

    this.wentToSeller=false;
     this.userService.doneLookingForSellers.subscribe(doneLookingForSellers=>
      { 
        console.log("DONE LOOKING SELLERS");
        console.log(doneLookingForSellers);
     console.log(this.userService.allSellersFiltered);
        
        if (doneLookingForSellers)
        this.filterSellersAndGetTheirProdsAndProms();

      this.userService.lookingForProducts.subscribe(isLookingforProds=>
      {
     
        if  (isLookingforProds)
        {
        this.alertService.showLoading();
        }
        else
        {
          this.filterPerCategoryAndSubCategory(this.userService.allSellersFiltered);
          this.alertService.dismissLoading();
        }
      });
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

 
      
  async filterSellersAndGetTheirProdsAndProms()
  {
    console.log(this.userService.userSearchSettings);
    console.log("GETTING SELLERS");
    if ((this.userService.userSearchSettings.position.geoPoint==null)&&((this.userService.userSearchSettings.position.description==this.noLocationStr)||(this.userService.userSearchSettings.position.description=="")))
 {
      console.log(this.userService.userSearchSettings);
    await this.initPosition();
    this.getFilteredSellersProdsAndDeals();
 
  }
  else
    this.getFilteredSellersProdsAndDeals();
}




goToSeller(seller:Seller,event:MouseEvent)
{
  console.log(event);
  console.log(event.srcElement.className);
  if (event.srcElement.className.includes('sellerDistance')
    ||event.srcElement.className.includes('star-outline')
    ||event.srcElement.className.includes('star')
    ||event.srcElement.className.includes("sellerTelNo"))
  return;

  
  console.log("GO TO SELLER");
  this.wentToSeller=true;
  this.navCtrl.push("SellerPage",{seller:seller});
}
  


  



    
  

}
