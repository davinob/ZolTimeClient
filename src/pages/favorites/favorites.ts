import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UserService, Seller, Product } from '../../providers/user-service';
import { AlertAndLoadingService } from '../../providers/alert-loading-service';
import { FormBuilder } from '@angular/forms/src/form_builder';
import { ElementRef } from '@angular/core/src/linker/element_ref';
import { AddressService } from '../../providers/address-service';
import { PopoverController } from 'ionic-angular/components/popover/popover-controller';
import { GlobalService } from '../../providers/global-service';
import { Storage } from '@ionic/storage';

/**
 * Generated class for the FavoritesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-favorites',
  templateUrl: 'favorites.html',
})
export class FavoritesPage {


  allInputsShows:any={};


 
  wentToSeller:boolean=false;

  

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private userService:UserService, 
    public alertService: AlertAndLoadingService,
     public storage:Storage
    ) {
      
     
  }

  
  pageIsShown:boolean;

  ionViewDidLeave()
  {
    this.pageIsShown=false;
  }
  
  getURL(url:string)
  {
    return 'url(' + url + ')';
  }

  filterSellersByKeysAndGetTheirProdsAndProms(){
   this.userService.filterSellersByKeysAndGetTheirProdsAndDeals(this.userService.myFavorites);
  }


  haveOrganizedSellers():boolean{
  return this.favoriteSellers!=null && this.favoriteSellers.length>0;

  }

  getOrganizedSellers():Array<any>{ //doing filter here also in case we removed one from favorite here:
    
    this.favoriteSellers=this.favoriteSellers.filter((seller) => {
      return this.userService.myFavorites.filter(key=>key==seller.key).length>0;
    });
    
    return this.favoriteSellers;
  }

   

  favoriteSellers=new Array();

  
  
  lookingForSellerSubscribed:boolean=false;
  lookingForProdsSubscribed:boolean=false;


  
  ionViewDidEnter()
  {
    this.pageIsShown=true;
    console.log("ION VIEW DID ENTER");
    console.log(this.wentToSeller);
    
    if (this.userService.doneLookingForSellersCompleteValue && !this.wentToSeller)//so we've been there at least once, sellers are already ready
    {
      this.filterSellersByKeysAndGetTheirProdsAndProms();
    }

    this.wentToSeller=false;

    if (!this.lookingForSellerSubscribed)
    {
    this.userService.doneLookingForSellers.subscribe(doneLookingForSellers=>
      { 
        this.lookingForSellerSubscribed=true;
        if (!this.pageIsShown)
        return;

        console.log("DONE LOOKING SELLERS");
        console.log(doneLookingForSellers);
        console.log(this.userService.allSellersFiltered);
        
        if (doneLookingForSellers && this.pageIsShown)
        this.filterSellersByKeysAndGetTheirProdsAndProms();

      });
    }
    
    if (!this.lookingForProdsSubscribed)
    {
    this.userService.lookingForProducts.subscribe(isLookingforProds=>
      {
        this.lookingForProdsSubscribed=true;
        if (!this.pageIsShown)
        return;
     
        if  (isLookingforProds)
        {
        this.alertService.showLoading();
        }
        else
        {
          this.setFavoriteSellers(this.userService.allSellersFiltered);
          this.alertService.dismissLoading();
        }
      });

    }

  }

  setFavoriteSellers(sellers:Array<any>)
  {
    this.favoriteSellers=new Array();

    sellers.forEach((seller,index)=>
    {
      if (seller && seller.products && seller.products.length>0)
      this.favoriteSellers=this.favoriteSellers.concat(Object.assign({}, seller)); 
    });
  
    console.log(this.favoriteSellers);


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

 
  



goToSeller(seller:Seller,event:MouseEvent)
{
  console.log(event);
  console.log(event.srcElement.className);
  if (event.srcElement.className.includes('sellerDistance')
    ||event.srcElement.className.includes('star-outline')
    ||event.srcElement.className.includes('star'))
  return;

  
  console.log("GO TO SELLER");
  this.wentToSeller=true;
  this.navCtrl.push("SellerPage",{seller:seller});
}
  




  



 
  



    
  

}
