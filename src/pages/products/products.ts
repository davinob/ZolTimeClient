import { Component,ViewChild,ElementRef, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, TextInput  } from 'ionic-angular';
 
import { UserService, Seller } from '../../providers/user-service';
import { AlertAndLoadingService } from '../../providers/alert-loading-service';


import { FormBuilder } from '@angular/forms';


import { Geolocation,Geoposition } from '@ionic-native/geolocation';


import { AddressService } from '../../providers/address-service';

import {Product} from "../../providers/user-service";

import { PopoverController,Content  } from 'ionic-angular';

import { Storage } from '@ionic/storage';

import * as globalConstants from '../../providers/globalConstants'; 

import { Diagnostic } from '@ionic-native/diagnostic';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { TranslateService } from '@ngx-translate/core';

import { first } from 'rxjs/operators';



@IonicPage()
@Component({
  selector: 'page-products',
  templateUrl: 'products.html',
})
export class ProductsPage {


  allInputsShows:any={};
  
  @ViewChild('searchInput') searchInput:TextInput;
  @ViewChild(Content) content: Content;

 
  justWentToSeller:boolean=false;
  noLocationStr:string;
  

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private userService:UserService ,
     public formBuilder: FormBuilder,
    public alertService: AlertAndLoadingService,
    private geolocation: Geolocation,
    public addressService:AddressService,
    public popoverCtrl: PopoverController,
     public storage:Storage,
    public diagnostic: Diagnostic,
    public locationAccuracy: LocationAccuracy,
    public platform: Platform, public translateService: TranslateService, public zone:NgZone) {

      this.initComp();

   
     
  }


async initComp()
{
 this.noLocationStr=await this.translateService.get('אין מיקום').pipe(first()).toPromise();

 this.translateService.onLangChange.subscribe(async langHasChanged=>
  {
 let value:string=await this.translateService.get('אין מיקום').pipe(first()).toPromise();
  
 console.log("TRANS EIN MIKUM:"+value);
  this.noLocationStr=value;
  //no location found
  if (this.userService.userSearchSettings.position && this.userService.userSearchSettings.position.geoPoint && this.userService.userSearchSettings.position.geoPoint.latitude==0 && this.userService.userSearchSettings.position.geoPoint.longitude==0)
  {
    this.userService.userSearchSettings.position.description=this.noLocationStr;
  }


});
 
}
  


  
  showPromoQty(product:Product)
  {
    return product.bestPromo && product.bestPromo.quantity>0;
  }

  getCategories()
  {
    return globalConstants.categories;
  }



  getURL(url:string)
  {
    return 'url(' + url + ')';
  }

  categorySelected:any=null;
  subCategorySelected:string=null;

  selectCategory(catego:any){
    //console.log("CATEGO SELECTED:"+catego);
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
    //console.log("Sub CATEGO SELECTED:"+subCatego);
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
  return this.sellersFiltered && this.sellersFiltered.length>0;

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

  thereAreALotOfResults:boolean=false;
  categoriesWithCatInResults=new Array();




  areThereALotOfResults()
{
  return  this.categorySelected || (this.haveOrganizedSellers() && this.getOrganizedSellers().length>2);
}

isCategoryInResults(catego):boolean
{
  let filtered= this.getOrganizedSellers().filter(val=>
    {
    return val.category==catego;
    })

    return filtered.length>0;
}

getCategoriesInResults()
{
  return globalConstants.categories.filter(catego=> this.isCategoryInResults(catego.name));
}



  filterPerCategoryAndSubCategory(sellers:Array<any>)
  {
    this.sellersFiltered=new Array();
  //  console.log("FILTER PER CATEGO AND SUB CATEGO");
  //  console.log(sellers);
    sellers.forEach((seller,index)=>
    {
      if (seller && seller.products && seller.products.length>0)
      this.sellersFiltered=this.sellersFiltered.concat(Object.assign({}, seller)); 
    });
  
    //console.log(this.sellersFiltered);

    this.thereAreALotOfResults=this.areThereALotOfResults();
    this.categoriesWithCatInResults=this.getCategoriesInResults();


    if (!this.categorySelected)
    return;

    //console.log(this.sellersFiltered);
    
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
    //console.log("INIT POSITION");
    this.userService.userSearchSettings.position= this.addressService.createPosition(0,0,this.noLocationStr);
   
    try{
  
    
    let resp= await this.getUserPosition();

      //console.log("INIT POSITION");
      //console.log(resp);
      //console.log("AFTER GETTING POSITION");
    
      this.userService.userSearchSettings.position=await this.addressService.createPositionWithCurrentLocation(resp.coords.latitude,resp.coords.longitude);
      //console.log("POSITION NEWW");
      //console.log(this.userService.userSearchSettings.position);

      
     }
     catch(error) 
     {
       //console.log("ERROR FOR GEOLOCATION");
     this.userService.userSearchSettings.position=this.addressService.createPosition(0,0,this.noLocationStr);
  
    }
   
  }


  getUserPosition():Promise<any> {
    return new Promise((resolve)=> {
      const HIGH_ACCURACY = 'high_accuracy';
      if (this.platform.is('cordova')) {
        this.platform.ready().then(async () => {
          
          let enabled=await this.diagnostic.isLocationEnabled();

         
            //console.log("GETUSERPOS1");
            if (enabled) {
              if (this.platform.is('android')) {
                //console.log("GETUSERPOS2");
                this.diagnostic.getLocationMode().then(locationMode => {
                  //console.log("GETUSERPOS3");
                  if (locationMode === HIGH_ACCURACY) {
                    //console.log("GETUSERPOS4");
                    this.geolocation.getCurrentPosition({timeout: 30000, maximumAge: 0, enableHighAccuracy: true}).then(pos => {
                     
                      //console.log("GETUSERPOS5");
                       resolve({
                        coords: {
                          latitude: pos.coords.latitude,
                          longitude: pos.coords.longitude
                        }
                      });
                    }).catch(error => resolve(error));
                  } else {
                    //console.log("GETUSERPOS6");
                    this.geolocation.getCurrentPosition({timeout: 30000,enableHighAccuracy:false}).then(
                      position => {
                        //console.log("GETUSERPOS6.1");
                        //console.log(position);
                        resolve(position);
                      }, error => resolve(error)
                    );
                  }
                });
              } else {
                this.geolocation.getCurrentPosition({timeout: 30000, maximumAge: 0, enableHighAccuracy: true}).then(pos => {
                  //console.log("GETUSERPOS8");
                  resolve({
                    coords: {
                      latitude: pos.coords.latitude,
                      longitude: pos.coords.longitude
                    }
                  });
                }).catch(error => resolve(error));
              }
            } else {
              //console.log("GETUSERPOS9.1");
              this.locationAccuracy.request(1).then(result => {
                //console.log("GETUSERPOS9");
                //console.log(result);
                if (result) {
                  //console.log("GETUSERPOS10");
                  this.geolocation.getCurrentPosition({timeout: 30000,enableHighAccuracy:false}).then(
                    position => {
                      //console.log("GETUSERPOS11");
                      //console.log(position);
                      resolve(position);
                    }, error => resolve(error)
                  );
                }
                else
                {
                  this.getUserPosition().then(result => resolve(result), error => resolve(error));
                }
              }, error => {
                resolve(error)
              });
            }
       
        });
      } else {
        resolve('Cordova is not available');
      }
    });
  }

  askForHighAccuracy(): Promise<Geoposition> {
    return new Promise(resolve => {
      this.locationAccuracy
        .request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(() => {
        this.geolocation.getCurrentPosition({timeout: 300000}).then(
          position => {
            resolve(position);
          }, error => resolve(error)
        );
      }, error => resolve(error));
    });
  }


  
  

  shouldShowSeller(seller:Seller):boolean
  {
    //console.log(seller);
  return !this.userService.userSearchSettings.onlyShowPromotion || seller.hasAtLeastOnePromo;
  }

 pageIsShown:boolean;

  ionViewDidLeave()
  {
    this.pageIsShown=false;
  }
  
  alreadyShownAfterFirstEnter:boolean;

  lookingForSellerSubscribed:boolean=false;
  lookingForProdsSubscribed:boolean=false;



  ionViewDidEnter()
  {
 console.log("ENTER");
 console.log(this.userService.userSearchSettings.position.description);

    if (this.content)
    {
      this.content.resize();
    }
    //console.log("HAS SUBSCRIBED TO FETCH SELLERS?");
    //console.log(this.lookingForSellerSubscribed);
    this.pageIsShown=true;
    //console.log("ION VIEW DID ENTER");
    this.alreadyShownAfterFirstEnter=false;
    if (this.justWentToSeller)
    {
      this.justWentToSeller=false;
      return;
    }

    if (this.userService.doneLookingForSellersCompleteValue)
    {
      //console.log("FILTERING HERE");
      this.filterSellersAndGetTheirProdsAndProms();
     }

    this.justWentToSeller=false;

    if (!this.lookingForSellerSubscribed)
    {
     this.userService.doneLookingForSellers.subscribe(doneLookingForSellers=>
      { 
        this.lookingForSellerSubscribed=true;
        if (!this.pageIsShown)
        return;
      //  console.log("IN THE SUBSCRIBE doneLookingForSellers2");
      //  console.log("DONE LOOKING SELLERS");
     //   console.log(doneLookingForSellers);
    // console.log(this.userService.allSellersFiltered);
        
        if (doneLookingForSellers && this.pageIsShown)
        this.filterSellersAndGetTheirProdsAndProms();
    
      });
    
      this.userService.lookingForProducts.subscribe(isLookingforProds=>
      {
        this.lookingForProdsSubscribed=true;
        if (!this.pageIsShown)
        return;
        //console.log("IN THE SUBSCRIBE isLookingforProds2");

        if  (isLookingforProds)
        {
        this.alertService.showLoading();
        }
        else
        {
          //console.log("ABOUT TO FILTER PER CATEGO AND SUB CATEGO:");
          //console.log(this.userService.allSellersFiltered);

          this.filterPerCategoryAndSubCategory(this.userService.allSellersFiltered);
          this.alertService.dismissLoading();
        }
      });

      this.userService.allSellersHasBeenUpdated.subscribe(()=>
        {
          this.filterPerCategoryAndSubCategory(this.userService.allSellersFiltered);
        });
  
    }


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
    //console.log(this.userService.userSearchSettings);
    //console.log("GETTING SELLERS");
    //console.log(this.userService.userSearchSettings.position.description);

    if   (this.hasNoLocationFound()) {
      //console.log(this.userService.userSearchSettings);

      this.alertService.showLoading(); 

      let initPromise= this.initPosition();

      let timeOutPromise=new Promise((resolve)=>{
        setTimeout(resolve,15000)});

      await Promise.race([initPromise, timeOutPromise]);

      if   (this.hasNoLocationFound()&&!this.alreadyShownAfterFirstEnter) {
        let errorMessage=await this.translateService.get(" מיקום לא אותר, נא להדליק את מקלט הGPS או להכניס כתובת חיפוש.").pipe(first()).toPromise();
      this.alertService.showToastNoDismiss({message:errorMessage});
      this.alreadyShownAfterFirstEnter=true;

     }
     
    this.getFilteredSellersProdsAndDeals();
 
  }
  else
    this.getFilteredSellersProdsAndDeals();
}

hasNoLocationFound():boolean
{
  return !this.userService.userSearchSettings.position.description ||this.userService.userSearchSettings.position.description==this.noLocationStr;
}


goToSeller(seller:Seller,event:MouseEvent)
{
  //console.log(event);
  //console.log(event.srcElement.className);
  if (event.srcElement.className.includes('star-outline')
    ||event.srcElement.className.includes('star'))
  return;

  
  //console.log("GO TO SELLER");
  this.justWentToSeller=true;
  this.navCtrl.push("SellerPage",{seller:seller});
}
  






    
  

}
