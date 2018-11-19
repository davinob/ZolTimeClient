

import { Injectable } from '@angular/core';



  import { Position, Address, AddressService } from './address-service';
  
  import * as firebase from 'firebase/app';
  
   
import { Storage } from '@ionic/storage';
import { Subject } from 'rxjs';

import { merge  } from 'rxjs/operators';

  
  
export interface Seller {
  email: string;
  address?:Address;
  profileCompleted?:boolean;
  products?:Array<Product>;
  promotions?:Array<Promotion>;
  productsPerCategory?:{};
  restaurantName:string;
  description:string;
  telNo:string;
  distanceFromPosition:number;
  hasAtLeastOnePromo:boolean;
  key:string;
  category:string;
  hashgaha?:any;
  hashgahaDescription?:any;
  days?:any;

  }

 

export interface Product{
  name: string,
  description: string,
  quantity?: number,
  currentQuantity?:number,
  originalPrice: number,
  reducedPrice?: number,
  key:string,
  uID:string,
  discount?:number,
  enabled?:boolean,
  isPreviouslyChosen?:boolean,
  bestPromo?:any
}

export interface Promotion{
  name: string,
  products:Array<Product>,
  isOneTime:boolean,
  promotionStartTime:string,
  promotionEndTime:string,
  days?:{},
  date?:any,
  key?:string,
  uID?:string,
  isActivated:boolean
}


export interface SearchSettings {
  position:Position;
  hashgaha: string;
  range:number;
  onlyShowPromotion:boolean;
  }

@Injectable()
export class UserService {

  db=firebase.firestore();
  
  
  sellersCollectionRef: firebase.firestore.CollectionReference;
  favoritesCollectionRef: firebase.firestore.CollectionReference;
 
  userProducts:Array<any>=[];
  userPromotions:Array<any> = [];
  
  allSellers:Array<any>=[];
  allSellersFiltered:Array<any>=[];

  allSellersHasBeenUpdated:Subject<boolean>=new Subject();

  userSearchSettings:SearchSettings;

  

  lookingForProducts:Subject<boolean>=new Subject();
  doneLookingForSellers:Subject<boolean>=new Subject();
  doneLookingForSellersCompleteValue:boolean=false;

  
  myFavorites:Array<string>=null;


  userFCMToken:string="";

  nbMinPerKm=16;

  constructor(private addressService:AddressService,
  private storage:Storage) {


    this.userSearchSettings={
      position:{geoPoint:null,description:"",isAddress:true},
      hashgaha:"ללא",
      range:200, //max 200mn for search range
      onlyShowPromotion:false};
   
      
       const settings = {timestampsInSnapshots: true};
        this.db.settings(settings);

        this.sellersCollectionRef = this.db.collection('sellers');
        this.favoritesCollectionRef=this.db.collection('favorites');
     
        this.initFavoritesFromStorage();
        //this.initSearchSettingsFromStorage();
       
        
      }


     /* initSearchSettingsFromStorage() {
    

        this.storage.get("settings").then(val => {
          if (val)
          {
           this.userSearchSettings.hashgaha=val.hashgaha;
           this.userSearchSettings.onlyShowPromotion=val.onlyShowPromotion;
           this.userSearchSettings.range=val.range;
          }
            console.log(this.userSearchSettings);
         });
    
      
      }
*/

      initFavoritesFromStorage()
      {
      this.storage.get("favorites").then((favs:Array<string>) => {
        this.myFavorites=favs;
        console.log("FAVORITES");
        console.log(this.myFavorites);
        });
      }


     setSellerHashgahaDescription(seller:any)
      {
        console.log(seller.hashgaha);
        console.log(seller);
        if (!seller.hashgaha)
        return;

        if (seller.hashgaha["למהדרין"]) {
          seller.hashgahaDescription= "למהדרין";
          return;
       }

       if (seller.hashgaha["כשר"]) {
        seller.hashgahaDescription= "כשר";
        return;
     }
    }


    async removeFromFavorites(seller:Seller)
    {
      if (!this.myFavorites)
        {
          return;
        }
        this.myFavorites=this.myFavorites.filter(fav=>fav!=seller.key);
        console.log(seller);
        console.log(this.myFavorites);
        
        this.storage.set("favorites",this.myFavorites);
        if (this.userFCMToken)
           await this.favoritesCollectionRef.doc(seller.key).collection("devices").doc(this.userFCMToken).delete();
        console.log("REMOVE FROM FAVORITES");
        return;
    
    }

    async addToFavorites(seller:Seller)
{

    if (!this.myFavorites)
    {
      this.myFavorites=new Array<string>();
    }

    this.myFavorites.push(seller.key);
    console.log(seller);
    console.log(this.myFavorites);
    
    console.log(this.userFCMToken);

    if (this.userFCMToken)
    {
     await this.favoritesCollectionRef.doc(seller.key).collection("devices").doc(this.userFCMToken).set({token:this.userFCMToken});
    console.log("Favorites added : "+ this.favoritesCollectionRef+"seller.key");
    }
    this.storage.set("favorites",this.myFavorites);
    console.log("ADDED TO FAVORITES");
}



isSellerFavorite(seller:Seller):boolean
{
    if (!this.myFavorites) 
      return false;
  let myFavs=this.myFavorites.filter(fav=>fav==seller.key);
    return myFavs.length>0;
}
 
 



      public getAllSellers()
      {
        this.doneLookingForSellers.next(false);
        return this.sellersCollectionRef.get().then(sellersInfos =>
          {

            if (!sellersInfos || sellersInfos.empty)
            {
              return;
            }
      
            sellersInfos.forEach(doc=>{
              
              let uid=doc.id;
            let seller=doc.data();  
            seller.key=uid;
            this.setSellerHashgahaDescription(seller);
            console.log(seller);

             this.allSellers.push(seller);
             this.allSellersFiltered.push(seller);
           });
           
          }).then(()=>{
            this.doneLookingForSellers.next(true);
            this.doneLookingForSellersCompleteValue=true;
          }).catch(error=>{
            console.log(error);
            this.doneLookingForSellers.next(true);
            this.doneLookingForSellersCompleteValue=true;
      
      
          });
      }


      public getSellerOfKey(sellerKey:string):Seller{
        
        if (!this.allSellers)
        return null;

        for (let index = 0; index < this.allSellers.length; index++) {
          const seller:Seller = this.allSellers[index];
          if (seller.key==sellerKey)
          return seller;
        }

        return null;
      }


   cloneSettings():SearchSettings
   {
     let newSettings:SearchSettings=Object.assign({},this.userSearchSettings);
     if (this.userSearchSettings.position.geoPoint!=null)
     {
       newSettings.position= this.addressService.createPosition(
         this.userSearchSettings.position.geoPoint.latitude,this.userSearchSettings.position.geoPoint.longitude,this.userSearchSettings.position.description);
     }
     else
     {
       newSettings.position.description=this.userSearchSettings.position.description;
       newSettings.position.geoPoint=null;
     }
       return newSettings;
   }

  
  async filterSellersByKeysAndGetTheirProdsAndDeals(keys:Array<string>)
  {
    console.log(keys);
    console.log(this.allSellers);
  
    this.lookingForProducts.next(true);
  
    this.allSellersFiltered=new Array();
  
    if (!keys || keys.length==0)
      {
        this.lookingForProducts.next(false);
        return;
      }
  
    this.allSellersFiltered=this.allSellers.filter((seller) => {
        return keys.filter(key=>key==seller.key).length>0;
  
      });
      
  
      if (!this.allSellersFiltered || this.allSellersFiltered.length==0) 
      {
        this.lookingForProducts.next(false);
        return;
      }
  
      let toWait=false;

      await this.allSellersFiltered.forEach(async seller=>{
       toWait=await this.fetchSellerProdsAndPromsReturnNeedsToWait(seller);
          console.log("SELLER IN PROMISE");
          console.log(seller);
         });

    if (!toWait)
    {
      console.log("STOP LOOKING FOR PRODS FROM METHOD 2");
      this.lookingForProducts.next(false);
    }
}




  async filterSellersAndGetTheirProdsAndDeals(settings:SearchSettings)
{
  this.userSearchSettings=settings;

  this.lookingForProducts.next(true);

  this.allSellersFiltered=new Array();

  console.log("queryAllBasedOnFilters");
  if (!this.userSearchSettings.position.geoPoint)
  {
    console.log("אין מיקום");
    this.lookingForProducts.next(false);
    return;
  }

  this.allSellersFiltered=this.allSellers.filter((seller) => {
    if (!seller ||!seller.address||!seller.enabled||!seller.profileCompleted)
    return false;

      let validSeller:boolean=true;

      if (this.userSearchSettings.hashgaha != "ללא") {
         validSeller=validSeller && seller.hashgaha[this.userSearchSettings.hashgaha];
      }

      validSeller=validSeller && this.addressService.isGeoPointNotSoFar(seller.address.geoPoint,this.userSearchSettings.position.geoPoint,this.userSearchSettings.range/this.nbMinPerKm);
    
      return validSeller;

    });
    

    if (!this.allSellersFiltered || this.allSellersFiltered.length==0) 
    {
      this.lookingForProducts.next(false);
      return;
    }

    let toWait=false;
     await this.allSellersFiltered.forEach(async seller=>{
    
        let distance=this.addressService.distance(seller.address.geoPoint,this.userSearchSettings.position.geoPoint);
        distance=Math.round(distance*100)/100;
        console.log("DISTANCE:" +distance);
       seller.distanceFromPosition=Math.round(distance*this.nbMinPerKm);
   
       toWait= await this.fetchSellerProdsAndPromsReturnNeedsToWait(seller);

   
        console.log("SELLER IN PROMISE");
        console.log(seller);
      });

    
      //sorting per distance:
      this.allSellersFiltered=this.allSellersFiltered.sort((seller1,seller2)=>{
        if (seller1.distanceFromPosition>seller2.distanceFromPosition)
        return 1;
        else
        return -1;
        
      });

      if (!toWait)
      {
        console.log("STOP LOOKING FOR PROD FROM METHOD 1");
        this.lookingForProducts.next(false);
      }
     

    

  }

  openHours(seller:Seller):any
  {
    let date=new Date();
    let dayIndex=new Date().getDay();
    
    //console.log(dayIndex);
    if (!seller.days || seller.days.length==0)
      return {open:false, message:""};
      
    //console.log(seller.days[dayIndex]);
    let timeH=date.getHours();
    let timeM=date.getMinutes();

    let sellerStartTime=seller.days[dayIndex].startTime;
    let sellerEndTime=seller.days[dayIndex].endTime;

    let startH=Number.parseInt(sellerStartTime.substr(0,2));
    let startM=Number.parseInt(sellerStartTime.substr(3,2));
    let endH=Number.parseInt(sellerEndTime.substr(0,2));
    let endM=Number.parseInt(sellerEndTime.substr(3,2));
  
      if ( 
        (timeH>startH ||(timeH==startH && timeM>startM))
        &&
        (timeH<endH || (timeH==endH && timeM<endM))
      )
      {
      return {open:true, message: "פתוח היום עד "+sellerEndTime};
    }
    else
    if (sellerStartTime==sellerEndTime) //closed today
    {
      return {open:false, message: "סגור היום"};
    }
    else
    
      return {open:false, message: "שעות פתיחה היום: "+sellerStartTime+ " - "+ sellerEndTime};
    
    


  }



async fetchSellerProdsAndPromsReturnNeedsToWait(seller:any)
{
  console.log("SELLER before return PROMISE");

  
  console.log(seller.products);
  console.log(seller.promotions);

  if (!seller.productsAlreadyFetched)
  {
    let sellerProdsObserable:Subject<boolean>=new Subject();
    let sellerPromsObserable:Subject<boolean>=new Subject();


    this.sellersCollectionRef.doc(seller.key).collection("products").onSnapshot(
    snapshot =>
    {
      if (!snapshot)
      return;

      seller.products=new Array();

        console.log("PRODUCTS");
      

        snapshot.forEach(product=>{
             seller.products.push(product.data());
        });

        console.log(seller.products);
        seller.productsAlreadyFetched=true;

       sellerProdsObserable.next(true);
      });

     
     this.sellersCollectionRef.doc(seller.key).collection("promotions").onSnapshot(
              promotionsInfo =>
              { 
                seller.promotions=new Array();
                  console.log("PROMOTIONSSS");
               
                  promotionsInfo.forEach(promotion=>{
                    seller.promotions.push(promotion.data());
                  });
      
                  sellerPromsObserable.next(true);
              });
        
      sellerProdsObserable.pipe(merge(sellerPromsObserable)).subscribe(()=>
         {
             console.log("DOING UPDATE OF PRODS/PROMS");
                this.findAndSetBestPromoForAllProductsOfSeller(seller);
                this.allSellersHasBeenUpdated.next(true);
                console.log("STOP LOOKING FOR PROD FROM OBS");
                this.lookingForProducts.next(false);
               
          }
          );

         return true;     

    }
    else
    {

      console.log("SELLER before return PROMISE 1");
      this.findAndSetBestPromoForAllProductsOfSeller(seller);
      console.log("SELLER before return PROMISE 2");
    
      return false;
    }
   
      
}


findAndSetBestPromoForAllProductsOfSeller(seller:any){
  console.log("findAndSetBestPromoForAllProducts:")
 

    console.log(seller);
    let hasFoundOnePromo=false;
    if (!seller)
    return;


    seller.products.forEach((product, indexProd)=>
    {
     
      
      let lastGoodPromo=null;

      
      if (!seller.promotions)
      { 
        return;
      }

 
      for(let i=0; i<seller.promotions.length;i++)
      {
        let promo=seller.promotions[i];
        
        if (!promo.isActivated)
        {
          continue;
        }

      

        let promoTimes=this.calculatePromotionMessage(promo);
        if (promoTimes.notValid)
        {
          continue;
        }
        
       

        for (let prodKey in promo.products)
        {
          let prodPromo=promo.products[prodKey];
          if (!prodPromo)
          continue;

        
          if (prodKey==product.key)
          {
            console.log("PRICE COMPARISONS");
            if (lastGoodPromo)
            {
            console.log(prodPromo.reducedPrice+"vs"+lastGoodPromo.price);
            }

            if (lastGoodPromo==null ||(prodPromo.reducedPrice<lastGoodPromo.price)&&(prodPromo.currentQuantity>0))
            {
              hasFoundOnePromo=true;
              lastGoodPromo={price:prodPromo.reducedPrice,
                            percentage:(prodPromo.reducedPrice*100/product.originalPrice),
                            quantity:prodPromo.currentQuantity,
                            name:promo.name,
                            promoTimes:promoTimes};

                    console.log("lastGoodPromo:");
                            console.log(lastGoodPromo);
            }
          } 
        }
      }
  
      seller.products[indexProd].bestPromo=lastGoodPromo;
      });

      seller.products=seller.products.sort((prod1,prod2)=>
      {
       if (!prod1.bestPromo)
       return 1;
       if (!prod2.bestPromo)
       return -1;
        if (prod1.bestPromo.percentage>prod2.bestPromo.percentage)
        return -1;
        if (prod1.bestPromo.percentage<prod2.bestPromo.percentage)
        return 1;
        
        return 0;
      });

      seller.productsPerCategory=this.caculateProductsGroupedByCategory(seller);

     // seller.promotions=null;
      seller.hasAtLeastOnePromo=hasFoundOnePromo;
    
 
  }



  public caculateProductsGroupedByCategory(seller:any):{}
  {
    let productsPerCategos={};
    
    if (!seller.products)
      return {};

      seller.products.forEach(
      product=>{
        if (productsPerCategos[product.category])
        {
        (<Array<any>>productsPerCategos[product.category]).push(product);
        }
        else
        {
          productsPerCategos[product.category]=[product];
        }
    });
    
    return productsPerCategos;
  }


 
 
async searchAddressesAndSellers(searchTerm:string,sellersNames:Array<any>)
{
 
   let addresses=await this.addressService.searchAddresses(searchTerm);
    
   console.log("SEARCHED ADDRESSES");
   console.log(addresses);
     
      let sellersAndAddresses=new Array();

      sellersAndAddresses=sellersAndAddresses.concat(sellersNames,addresses);
      console.log(sellersAndAddresses);
    
      return sellersAndAddresses;
 
}

getAllSellersWithSearchTerm(searchTerm:string)
{
  let sellers=new Array();
  if (!this.allSellers || this.allSellers.length==0)
  {
    return sellers;
  }

  this.allSellers.filter(seller=>{
    let sellerName:string=seller.restaurantName;
    return sellerName.toLocaleLowerCase().indexOf(searchTerm.toLocaleLowerCase())>=0;
  }).forEach((seller)=>{
  sellers.push({description:seller.restaurantName,address:seller.address.description,key:seller.key,isAddress:false});
  });

  return sellers;
}


calculatePromotionMessage(promo:Promotion):any
{
      let nowDate=new Date();
 
      let datesCalculated=this.calculatePromoStartEndDates(promo,false);
      let startDate:Date=datesCalculated.startDate;
      let endDate:Date=datesCalculated.endDate;

     
      let timeDiffInSecBeforeStart=Math.round((startDate.valueOf()-nowDate.valueOf())/1000);
      let timeDiffInSecBeforeEnd=Math.round((endDate.valueOf()-nowDate.valueOf())/1000);

      if (timeDiffInSecBeforeEnd>(15 * 3600)) //limit to next 15 hours
      {
        return {start:"",notValid:true};
      }

      let timeDiffInSec=timeDiffInSecBeforeStart;
      if (timeDiffInSecBeforeStart<=0)
      {
    
        timeDiffInSec=Math.round( (endDate.valueOf()-nowDate.valueOf())/1000);
        
        if (timeDiffInSec<0)
        {
          return {start:"",notValid:true};
        }
          
      }
    
      let promoTimes={start:"", end:"",notValid:false,hasStarted:false};
     
        promoTimes.hasStarted=true;

      promoTimes.end+=this.formT(endDate.getHours())+":"+this.formT(endDate.getMinutes());
      promoTimes.start+=this.formT(startDate.getHours())+":"+this.formT(startDate.getMinutes());
   
    
      return promoTimes;
}





calculatePromoStartEndDates(promo:Promotion, checkForNext:boolean):any
{
  let nowDate=new Date();

  let startDate:Date;
  let endDate:Date;

  let startH=Number.parseInt(promo.promotionStartTime.substr(0,2));
  let startM=Number.parseInt(promo.promotionStartTime.substr(3,2));

   
  let endH=Number.parseInt(promo.promotionEndTime.substr(0,2));
  let endM=Number.parseInt(promo.promotionEndTime.substr(3,2));

  if (!promo.isOneTime)
  {

    let daysToAddToToday=-1;


    if (((startH>endH)||((startH==endH)&&((startM>endM)))) //promotion not in same day
      && 
      ((nowDate.getHours()<endH)||((nowDate.getHours()==endH)&&((nowDate.getMinutes()<endH))))
      )
    {
      nowDate=new Date(nowDate.valueOf()-(1000 * 60 * 60 * 24))
    }

    let nowD:number=nowDate.getDay()+7; //on sunday it returns 0, so adding 7
    
    let i=-1;
    
    if (checkForNext)
    {
      i=0;
    }

    
 
   
    while (i<=7 && daysToAddToToday==-1)
    {
  
      if (promo.days[(nowD+i)%7+1])
      {
        daysToAddToToday=i+1;
      }
      i++;
    }
  
    startDate=new Date(nowDate.valueOf()+(daysToAddToToday*1000 * 60 * 60 * 24));
    startDate.setSeconds(0);
    startDate.setMilliseconds(0);
    endDate=new Date(startDate);

  }
  else
  {
    let promoDate=promo.date;
    if (!(promo.date instanceof Date))
    {
      promoDate=promoDate.toDate();
    }

    startDate=new Date(promoDate);
    endDate=new Date(promoDate);
  }
    
   
    startDate.setHours(startH);
    startDate.setMinutes(startM);
  
  
   endDate.setHours(endH);
   endDate.setMinutes(endM);
  
  if ((startH>endH)||((startH==endH)&&((startM>endM)))) //promotion not in same day
  {
   
    endDate=new Date(endDate.valueOf()+(1000 * 60 * 60 * 24));
   
  }

  if ((!promo.isOneTime)&&(!checkForNext)&&(Math.round( endDate.valueOf()-nowDate.valueOf())<0))
      return this.calculatePromoStartEndDates(promo,true);
  

  return {startDate:startDate,endDate:endDate};
  
}










formT(num:number):string
{
   if (num.toString().length==1)
    return "0"+num;
  return num+"";
}




}
