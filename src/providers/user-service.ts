

import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/of';
import { Subscription } from 'rxjs/Subscription';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  AngularFirestoreDocument} from 'angularfire2/firestore';
  import { Position, Address, AddressService } from './address-service';
  
  import * as firebase from 'firebase/app';
  
  

  import { Subject } from 'rxjs/Subject';
  

  import { AuthService } from './auth-service';
  
  import { GlobalService } from './global-service';

  import { HttpClient, HttpParams } from '@angular/common/http';

  import { from } from 'rxjs/observable/from';

  
  
export interface Seller {
  email: string;
  address?:Address;
  profileCompleted?:boolean;
  products?:Array<Product>;
  promotions?:Array<Promotion>;
  restaurantName:string;
  description:string;
  telNo:string;
  distanceFromPosition:number;
  hasAtLeastOnePromo:boolean;

  }

  export interface User {
    email: string;
    profileCompleted?:boolean;
    authenticated?:boolean
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
  productsCollection:firebase.firestore.CollectionReference;
  promotionsCollection:firebase.firestore.CollectionReference;
  currentUser:User={email:"unset",
                    authenticated:false};
  userStatus:Subject<any>=new Subject<any>();
   
  currentUserObs:Observable<any>=null;
  
  userProducts:Array<any>=[];
  userPromotions:Array<any> = [];
  
  allSellers={};
  allSellersOrganized:Array<Seller>=[];

  previousSearchSettings:SearchSettings=null;

  lookingForProducts:Subject<boolean>=new Subject();

  

  constructor(private afs: AngularFirestore,public authService:AuthService,
   private http: HttpClient,
    private globalService:GlobalService,
  private addressService:AddressService) {
      this.usersCollection = this.afs.collection<Seller>('users'); 
        this.sellersCollectionRef = this.db.collection('sellers');
        
        this.lookingForProducts.next(false);
   
      }



   public  updateUserAuthConnected(flag:boolean)
   {
    this.currentUser.authenticated=flag;

   }


   public initCurrentUser(userID:string):Observable<any>
   {
     console.log("init with userID:"+userID);
         this.globalService.userID=userID;
         
         this.currentUserObs=this.usersCollection.doc(this.globalService.userID).valueChanges();
         
        this.currentUserObs.subscribe(data =>
         { 
           this.setCurrentUserData(data);
         });
 
        
 
         return this.userStatus.asObservable().first(data=>data!=null);
   }

  
  

  public setCurrentUserData(data:any)
  {
    this.currentUser=data;

    
  }


  areSearchSettingTheSame(settings:SearchSettings):boolean
  {
    console.log(settings);
    console.log(this.previousSearchSettings);

    if (this.previousSearchSettings==null&&settings!=null)
      return false;
   
    if (settings.position)
    {
      if (settings.position.description!=this.previousSearchSettings.position.description)
      return false;
      if (settings.position.geoPoint){
      if (settings.position.geoPoint.latitude!=this.previousSearchSettings.position.geoPoint.latitude)
      return false;
      if (settings.position.geoPoint.longitude!=this.previousSearchSettings.position.geoPoint.longitude)
      return false;
      }
    }

 
    if (settings.hashgaha && settings.hashgaha!=this.previousSearchSettings.hashgaha)
     return false;

    if (settings.range &&  settings.range!=this.previousSearchSettings.range)
      return false;
   
    
    return true;
  }


  cloneSettings(settings:SearchSettings):SearchSettings
  {
    let newSettings:SearchSettings=Object.assign({},settings);
    if (settings.position.geoPoint!=null)
    {
      newSettings.position=this.addressService.createPosition(
      settings.position.geoPoint.latitude,settings.position.geoPoint.longitude,settings.position.description);
    }
    else
    {
      newSettings.position.description=settings.position.description;
      newSettings.position.geoPoint=null;
    }
      return newSettings;
  }

  getClosestCurrentSellers(settings:SearchSettings)
{

  if (this.areSearchSettingTheSame(settings))
   {
     console.log("SAME SETTINGS");
    return;
   } 

   this.lookingForProducts.next(true);

  this.previousSearchSettings=this.cloneSettings(settings);

  this.allSellers=new Array();
  this.allSellersOrganized=new Array();

  console.log("queryAllBasedOnFilters");
  if (!settings.position.geoPoint)
  {
    console.log("NO LOCATION");
    return;
  }

  let box=this.addressService.boundingBoxCoordinates(settings.position.geoPoint,settings.range);
  console.log(settings);
  console.log(box);
  
  let lesserGeopoint = new firebase.firestore.GeoPoint(box.swCorner.latitude, box.swCorner.longitude);
  let greaterGeopoint = new firebase.firestore.GeoPoint(box.neCorner.latitude, box.neCorner.longitude);
  
  



  let query:firebase.firestore.Query=this.sellersCollectionRef.where("address.geoPoint",">=",lesserGeopoint).
    where("address.geoPoint","<=",greaterGeopoint);

if (settings.hashgaha!="Any")
{
  console.log("HASHGAHA REQUESTED");
  console.log(settings.hashgaha);
  
if (settings.hashgaha=="Kosher")
query=query.where("hashgaha.Kosher","==",true);
else
query=query.where("hashgaha.Lemehadrin","==",true);
}

query.get().then(sellersInfos =>
    {
      console.log(sellersInfos);

      if (!sellersInfos || sellersInfos.empty)
      {
        this.lookingForProducts.next(false);
      }

      sellersInfos.forEach(doc=>{
        let uid=doc.id;

       this.allSellers[uid]=doc.data();
       console.log(this.allSellers[uid].address.geoPoint);
       console.log(settings.position.geoPoint);
        let distance=this.addressService.distance(this.allSellers[uid].address.geoPoint,settings.position.geoPoint);
        distance=Math.round(distance*100)/100;
       
        console.log("DISTANCE:" +distance);
       this.allSellers[uid].distanceFromPosition=distance;
   
        
       this.sellersCollectionRef.doc(uid).collection("products").get().then(
        productsInfo =>
        { 
          this.allSellers[uid].products=new Array();
            console.log("PRODUCTS");
         
         
            productsInfo.forEach(product=>{
              this.allSellers[uid].products.push(product.data());
            });
            console.log(this.allSellers[uid].products);
           
  

            this.sellersCollectionRef.doc(uid).collection("promotions").get().then(
              promotionsInfo =>
              { 
                this.allSellers[uid].promotions=new Array();
                  console.log("PROMOTIONSSS");
               
                  promotionsInfo.forEach(promotion=>{
                    this.allSellers[uid].promotions.push(promotion.data());
                  });
                  console.log(this.allSellers[uid].promotions);
                  console.log(this.allSellers);

                 this.organizeSellers(settings);
                 this.findAndSetBestPromoForAllProducts();
                 
                 this.lookingForProducts.next(false);
              }).catch(error=>{
                console.log("ERROR");
                console.log(error);
              });
      
        }).catch(error=>{
          console.log("ERROR");
          console.log(error);
        });

      });

  
  }).catch(error=>{
    console.log("ERROR");
    console.log(error);
  });
  

    console.log("SELLERS");
    console.log(this.allSellers);
    
}


findAndSetBestPromoForAllProducts(){
  console.log("findAndSetBestPromoForAllProducts:")
  console.log(this.allSellersOrganized);

  this.allSellersOrganized.forEach((seller,indexSeller)=>{
    let hasFoundOnePromo=false;
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
                            quantity:prodPromo.currentQuantity,
                            name:promo.name,
                            promoTimes:promoTimes};

                    console.log("lastGoodPromo:");
                            console.log(lastGoodPromo);
            }
          } 
        }
      }
      this.allSellersOrganized[indexSeller].products[indexProd].bestPromo=lastGoodPromo;
      });

      this.allSellersOrganized[indexSeller].promotions=null;
      this.allSellersOrganized[indexSeller].hasAtLeastOnePromo=hasFoundOnePromo;
      
  });

  console.log(this.allSellersOrganized);
  }

organizeSellers(settings:SearchSettings)
  {
    this.allSellersOrganized=new Array();
  
    for (let sellerKey in this.allSellers)
    {
      this.allSellersOrganized.push(this.allSellers[sellerKey]);
    }
    
    console.log("SHOWLOADING FALSE");

        
  }

   public getCurrentUser():User
  {
    return this.currentUser;
  }

  public getUserProducts():Array<any>
  {
    return this.userProducts;
  }


  public getUserProductsClone():Array<any>
  {
    return Object.assign([], this.userProducts);
  }

  public getUserPromotions():Array<any>
  {
    return this.userPromotions;
  }
  
 

  public isProfileCompleted():boolean
  {
    if (this.currentUser==null)
     return false;
    return this.currentUser.profileCompleted==true;
  }
  
  public createUser(userUID:string, email:string, restaurantName:string):Promise<any>
  {
  
   let user:User={
      email: email
      
    };
   console.log("creating user on UID"+userUID);
    
     return new Promise<any>((resolve, reject) => {
      let setUserPromise:Promise<void>=this.usersCollection.doc(userUID).set(user);
      console.log("PROMISE launched");
      setUserPromise.then( ()=>
      {
        console.log("PROMISE DONE");
      }
    ).catch( (error)=>
    {
      console.log(error);
    });
       resolve(setUserPromise);
    
  });

}



calculatePromotionMessage(promo:Promotion):any
{
      let nowDate=new Date();
      let promotionHasStarted=false;
      let datesCalculated=this.calculatePromoStartEndDates(promo,false);
      let startDate:Date=datesCalculated.startDate;
      let endDate:Date=datesCalculated.endDate;

     
      let timeDiffInSecBeforeStart=Math.round((startDate.valueOf()-nowDate.valueOf())/1000);
      let timeDiffInSecBeforeEnd=Math.round((endDate.valueOf()-nowDate.valueOf())/1000);

      console.log("TIME DIFF BEFORE END");
      console.log(timeDiffInSecBeforeEnd);
      
      if (timeDiffInSecBeforeEnd>(15 * 3600)) //limit to next 15 hours
      {
        return {start:"",notValid:true};
      }

      let timeDiffInSec=timeDiffInSecBeforeStart;
      if (timeDiffInSecBeforeStart<=0)
      {
        promotionHasStarted=true;
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


  console.log(promo);
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
      console.log("HERE 1");
      nowDate=new Date(nowDate.valueOf()-(1000 * 60 * 60 * 24))
    }

    let nowD:number=nowDate.getDay();
    console.log("nowD"+nowD);
    let i=-1;
    
    if (checkForNext)
    {
      console.log("HERE 2");
      i=0;
    }

    
 
   
    while (i<=7 && daysToAddToToday==-1)
    {
      console.log(i);
      console.log((nowD+i)%7+1);
      console.log(promo.days[(nowD+i)%7+1]);
      if (promo.days[(nowD+i)%7+1])
      {
        console.log("HERE 3");
        daysToAddToToday=i+1;
        console.log(daysToAddToToday);
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
    
  
  
      console.log("DATE RETURNED");
      console.log({startDate:startDate,endDate:endDate});

  return {startDate:startDate,endDate:endDate};
  
}










formT(num:number):string
{
   if (num.toString().length==1)
    return "0"+num;
  return num+"";
}





/*
//readonly START_PROMOTION_URL = 'https://us-central1-zoltime-77973.cloudfunctions.net/startPromotion';
//readonly STOP_PROMOTION_URL = 'https://us-central1-zoltime-77973.cloudfunctions.net/stopPromotion';
public stopTodayPromotion():Promise<any>
{

  this.currentUser.promotionStartDateTime=null;
  this.currentUser.promotionEndDateTime=null;
  this.timerSubscription.unsubscribe();

  return new Promise<any>((resolve, reject) => {
    
        let myHeaders = new HttpHeaders({'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
       let message={userID:this.globalService.userID};
        console.log("STOP PROMOTION!!");
        console.log(message);
        let obsPost=this.http.post(this.STOP_PROMOTION_URL,message,{headers:myHeaders}).subscribe(
          data => {
          //  alert('ok');
          },
          error => {
            console.log(error);
          }
        );
    
        resolve(obsPost);
     
      });


}

public startTodayPromotion():Promise<any>
{
  console.log("START PROMOTION");
  this.startPromotionTimer();

  return new Promise<any>((resolve, reject) => {

    let myHeaders = new HttpHeaders({'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    
    console.log(this.currentUser.promotionStartDateTime);
    console.log(this.currentUser.promotionEndDateTime);
    
    let message={userID:this.globalService.userID,
                startDateTime: this.currentUser.promotionStartDateTime+"",
                 endDateTime: this.currentUser.promotionEndDateTime+"" };
    console.log("START PROMOTION!!");
    console.log(message);
    let obsPost=this.http.post(this.START_PROMOTION_URL,message,{headers:myHeaders}).subscribe(
      data => {
        //alert('ok');
      },
      error => {
        console.log(error);
      }
    );

    resolve(obsPost);
 
  });
}*/
}
