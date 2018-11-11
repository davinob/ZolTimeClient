

import { Injectable } from '@angular/core';



import {
  AngularFirestore,
  AngularFirestoreCollection} from 'angularfire2/firestore';
  import { Position, Address, AddressService } from './address-service';
  
  import * as firebase from 'firebase/app';
  
   
import { Storage } from '@ionic/storage';
import { Subject } from 'rxjs';

  
  
export interface Seller {
  email: string;
  address?:Address;
  profileCompleted?:boolean;
  products?:Array<Product>;
  productsPerCategory?:{};
  promotions?:Array<Promotion>;
  restaurantName:string;
  description:string;
  telNo:string;
  distanceFromPosition:number;
  hasAtLeastOnePromo:boolean;
  key:string;
  category:string;

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
  date?:Date,
  key?:string,
  uID?:string,
  isActivated:boolean
}


export interface SearchSettings {
  position:Position;
  hashgaha: string;
  range:number;
  onlyShowPromotion:boolean
  }

@Injectable()
export class UserService {

  db=firebase.firestore();
  
  usersCollection: AngularFirestoreCollection<Seller>;
  sellersCollectionRef: firebase.firestore.CollectionReference;
  favoritesCollectionRef: firebase.firestore.CollectionReference;
 
  userProducts:Array<any>=[];
  userPromotions:Array<any> = [];
  
  allSellers:Array<any>=[];
  allSellersFiltered:Array<any>=[];

  userSearchSettings:SearchSettings;

  

  lookingForProducts:Subject<boolean>=new Subject();
  doneLookingForSellers:Subject<boolean>=new Subject();
  doneLookingForSellersCompleteValue:boolean=false;

  
  myFavorites:Array<string>=null;


  userFCMToken:string="";

  constructor(private afs: AngularFirestore,
  private addressService:AddressService,
  private storage:Storage) {


    this.userSearchSettings={
      position:{geoPoint:null,description:"",isAddress:true},
      hashgaha:"Any",
      range:10,
      onlyShowPromotion:false};
   
      
      this.usersCollection = this.afs.collection('users'); 
        this.sellersCollectionRef = this.db.collection('sellers');
        this.favoritesCollectionRef=this.db.collection('favorites');
     
        this.initFavoritesFromStorage();
        this.initSearchSettingsFromStorage();
        this.getAllSellers();
        
      }


      initSearchSettingsFromStorage() {
    

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


      initFavoritesFromStorage()
      {
      this.storage.get("favorites").then((favs:Array<string>) => {
        this.myFavorites=favs;
        console.log("FAVORITES");
        console.log(this.myFavorites);
        });
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
        this.sellersCollectionRef.get().then(sellersInfos =>
          {

            if (!sellersInfos || sellersInfos.empty)
            {
              return;
            }
      
            sellersInfos.forEach(doc=>{
              
              let uid=doc.id;
            let seller=doc.data();  
            seller.key=uid;

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

  
  filterSellersByKeysAndGetTheirProdsAndDeals(keys:Array<string>)
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
  
      this.allSellersFiltered.forEach(seller=>{
        this.lookingForProducts.next(true);
     
        this.fetchSellerProdsAndProms(seller).then(()=>
        {
          console.log("SELLER IN PROMISE");
          console.log(seller);
          this.lookingForProducts.next(false);
          
        });
   
        
        });
  
    }




  filterSellersAndGetTheirProdsAndDeals(settings:SearchSettings)
{
  this.userSearchSettings=settings;

  this.lookingForProducts.next(true);

  this.allSellersFiltered=new Array();

  console.log("queryAllBasedOnFilters");
  if (!this.userSearchSettings.position.geoPoint)
  {
    console.log("NO LOCATION");
    this.lookingForProducts.next(false);
    return;
  }

  this.allSellersFiltered=this.allSellers.filter((seller) => {
      let validSeller:boolean=true;

      if (this.userSearchSettings.hashgaha != "Any") {
         validSeller=validSeller && seller.hashgaha[this.userSearchSettings.hashgaha];
      }

      validSeller=validSeller && this.addressService.isGeoPointNotSoFar(seller.address.geoPoint,this.userSearchSettings.position.geoPoint,this.userSearchSettings.range);
    
      return validSeller;

    });
    

    if (!this.allSellersFiltered || this.allSellersFiltered.length==0) 
    {
      this.lookingForProducts.next(false);
      return;
    }

    this.allSellersFiltered.forEach(seller=>{
      this.lookingForProducts.next(true);
    
        let distance=this.addressService.distance(seller.address.geoPoint,this.userSearchSettings.position.geoPoint);
        distance=Math.round(distance*100)/100;
        console.log("DISTANCE:" +distance);
       seller.distanceFromPosition=distance;
   
      this.fetchSellerProdsAndProms(seller).then(()=>
      {
        console.log("SELLER IN PROMISE");
        console.log(seller);
        this.lookingForProducts.next(false);
        
      });
 
      
      });

    
      //sorting per distance:
      this.allSellersFiltered=this.allSellersFiltered.sort((seller1,seller2)=>{
      //  console.log("SELLERS COMPARISON");
       // console.log(seller1.distanceFromPosition);
        //console.log(seller2.distanceFromPosition);
        if (seller1.distanceFromPosition>seller2.distanceFromPosition)
        return 1;
        else
        return -1;
        
      });

    

  }


async fetchSellerProdsAndProms(seller:any)
{
  console.log("SELLER before return PROMISE");
  let promiseProducts:Promise<any>=new Promise(resolve=>{resolve()});
  let promisePromotions:Promise<any>=new Promise(resolve=>{resolve()});
  
  console.log(seller.products);
  console.log(seller.promotions);

  if (!seller.productsAlreadyFetched)
  {
    promiseProducts=this.sellersCollectionRef.doc(seller.key).collection("products").get().then(
    productsInfo =>
    { 
      seller.products=new Array();

        console.log("PRODUCTS");
        productsInfo.forEach(product=>{
          seller.products.push(product.data());
        });
        seller.productsAlreadyFetched=true;
        
      });
    }

    if (!seller.promsAlreadyFetched)
    {
  promisePromotions=this.sellersCollectionRef.doc(seller.key).collection("promotions").get().then(
          promotionsInfo =>
          { 
            seller.promotions=new Array();
              console.log("PROMOTIONSSS");
           
              promotionsInfo.forEach(promotion=>{
                seller.promotions.push(promotion.data());
              });
              seller.promsAlreadyFetched=true
  
          });
    }

      await Promise.all([promiseProducts,promisePromotions]);
      
      console.log("SELLER before return PROMISE 1");
          this.findAndSetBestPromoForAllProductsOfSeller(seller);
          console.log("SELLER before return PROMISE 2");
      
}


findAndSetBestPromoForAllProductsOfSeller(seller:any){
  console.log("findAndSetBestPromoForAllProducts:")
 

    console.log(seller);
    let hasFoundOnePromo=false;
    if (!seller)
    return;


    seller.products.forEach((product, indexProd)=>
    {
      console.log("IN THE EACH");
      
      let lastGoodPromo=null;

      
      if (!seller.promotions)
      { 
        return;
      }

      console.log("IN THE EACH2");
      for(let i=0; i<seller.promotions.length;i++)
      {
        let promo=seller.promotions[i];
        
        if (!promo.isActivated)
        {
          continue;
        }

        console.log("IN THE EACH3");

        let promoTimes=this.calculatePromotionMessage(promo);
        if (promoTimes.notValid)
        {
          continue;
        }
        
        console.log("IN THE EACH4");

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
      console.log("IN THE EACH5 ");
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
    startDate=new Date(promo.date);
    endDate=new Date(promo.date);
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
