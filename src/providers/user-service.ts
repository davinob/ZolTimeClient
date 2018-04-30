

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
  isPreviouslyChosen?:boolean
}

export interface Promotion{
  name: string,
  products:{},
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
  order:string;
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
  
  allProducts:{}={};
  allPromotions:{}={};
  allSellers=[];
  allSellersOrganized=[];

  

  

  constructor(private afs: AngularFirestore,public authService:AuthService,
   private http: HttpClient,
    private globalService:GlobalService,
  private addressService:AddressService) {
      this.usersCollection = this.afs.collection<Seller>('users'); 
        this.sellersCollectionRef = this.db.collection('sellers');
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


  getClosestCurrentSellers(settings:SearchSettings)
{

  

  console.log("queryAllBasedOnFilters");
  if (!settings.position.geoPoint)
  {
    console.log("NO LOCATION");
    return from(this.allSellers);
  }

  let box=this.addressService.boundingBoxCoordinates(settings.position.geoPoint,settings.range);
  console.log(settings);
  console.log(box);
  
  let lesserGeopoint = new firebase.firestore.GeoPoint(box.swCorner.latitude, box.swCorner.longitude);
  let greaterGeopoint = new firebase.firestore.GeoPoint(box.neCorner.latitude, box.neCorner.longitude);
  
  



  let query=this.sellersCollectionRef.where("address.geoPoint",">=",lesserGeopoint).
    where("address.geoPoint","<=",greaterGeopoint);

if (settings.hashgaha!="Any")
query=query.where("hashgaha","==",settings.hashgaha);


query.onSnapshot(sellersInfos =>
    {
      console.log(sellersInfos);
      sellersInfos.forEach(doc=>{
        let uid=doc.id;

       this.allSellers[uid]=doc.data();
   
        
       this.sellersCollectionRef.doc(uid).collection("products").onSnapshot(
        querySnapshot =>
        { 
          this.allSellers[uid].products=new Array();
            console.log("PRODUCTS");
         
            querySnapshot.forEach(product=>{
              this.allSellers[uid].products.push(product.data());
            });
            console.log(this.allSellers[uid].products);
           
  

            this.sellersCollectionRef.doc(uid).collection("promotions").onSnapshot(
              querySnapshot =>
              { 
                this.allSellers[uid].promotions=new Array();
                  console.log("PROMOTIONSSS");
                  querySnapshot.forEach(promotion=>{
                    this.allSellers[uid].promotions.push(promotion.data());
                  });
                  console.log(this.allSellers[uid].promotions);
                  console.log(this.allSellers);

                  this.organizeSellers(settings);
              });
      
        });
        });

  
  });

    console.log("SELLERS");
    console.log(this.allSellers);
    
}



organizeSellers(settings:SearchSettings)
  {
    this.allSellersOrganized=new Array();
    for (let sellerKey in this.allSellers)
    {
      this.allSellersOrganized.push(this.allSellers[sellerKey]);
    }
       
        
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


public updateCurrentUser(address:Address,description:string,
  hashgaha:string,categories:string):Promise<any>
{

let userUpdate:any={
address:address,
description:description,
hashgaha:hashgaha,
categories:categories,
profileCompleted:true,
promotionStartTime:"18:00",
promotionEndTime:"20:00"
};



console.log("upadting user on UID"+this.globalService.userID);
console.log(userUpdate); 

return new Promise<any>((resolve, reject) => {
let setUserPromise:Promise<void>=this.usersCollection.doc(this.globalService.userID).update(userUpdate);
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


public addProductToCurrentUser(
  name:string,description:string,
  originalPrice:number):Promise<any>
{
  let key=new Date().valueOf()+Math.random()+"";

  let product:Product={
  name: name,
  description: description,
  originalPrice: originalPrice,
  key:key,
  uID:this.globalService.userID
  };

  

console.log("adding product on UID"+this.globalService.userID);
console.log(product); 

return new Promise<any>((resolve, reject) => {
let setUserPromise:Promise<any>=this.productsCollection.doc(key).set(product);
console.log("PROMISE launched");
setUserPromise.then( ()=>
{
console.log("PROMISE DONE");
resolve(key);
}
).catch( (error)=>
{
console.log(error);
reject(new Error("Error inserting the data"));
});

     
});

}


public addPromotionToCurrentUser(promotion:Promotion):Promise<any>
{
  let key=new Date().valueOf()+Math.random()+"";
  promotion.key=key;
  promotion.uID=this.globalService.userID;
 

  console.log("MY PROMO:");
  console.log(promotion);

return new Promise<any>((resolve, reject) => {
let setUserPromise:Promise<any>=this.promotionsCollection.doc(key).set(promotion);
console.log("PROMISE launched");
setUserPromise.then( ()=>
{
console.log("PROMISE DONE");
resolve(setUserPromise);
}
).catch( (error)=>
{
console.log(error);
reject(new Error("Error inserting the data"));
});
    
});

}


public updatePromotionToCurrentUser(promotion:Promotion):Promise<any>
{
  console.log("MY PROMO:");
  console.log(promotion);

return new Promise<any>((resolve, reject) => {
let setUserPromise:Promise<any>=this.promotionsCollection.doc(promotion.key).update(promotion);
console.log("PROMISE launched");
setUserPromise.then( ()=>
{
console.log("PROMISE DONE");
resolve(setUserPromise);
}
).catch( (error)=>
{
console.log(error);
reject(new Error("Error inserting the data"));
});

      
});

}

















promoMessages:Array<any>=[];


 initPromotionMessage(promo:Promotion):boolean
{
 

      let nowDate=new Date();
      let promotionHasStarted=false;
      let datesCalculated=this.calculatePromoStartEndDates(promo,false);
      let startDate=datesCalculated.startDate;
      let endDate=datesCalculated.endDate;

     
      let timeDiffInSecBeforeStart=Math.round((startDate.valueOf()-nowDate.valueOf())/1000);
      let timeDiffInSec=timeDiffInSecBeforeStart;
      if (timeDiffInSecBeforeStart<=0)
      {
        promotionHasStarted=true;
        timeDiffInSec=Math.round( (endDate.valueOf()-nowDate.valueOf())/1000);
        
        if (timeDiffInSec<0)
        {
          this.promoMessages[promo.key]= {message:"Promotion is expired",isExpired:true};
          return true;
        }
          
      }

      if (!promo.isActivated)
      {
        this.promoMessages[promo.key]={message:"",isExpired:false}
        return false;
      }



      let secondsDiff=timeDiffInSec%(60);
      timeDiffInSec-=secondsDiff;
      let timeDiffInMin=timeDiffInSec/60;
      let minutesDiff=(timeDiffInMin)%60;
      timeDiffInMin-=minutesDiff;
      let timeDiffInHours=timeDiffInMin/60;
      let hoursDiff=timeDiffInHours%24;
      timeDiffInHours-=hoursDiff;
      let daysDiff=timeDiffInHours/24;

     
    
      let promoMessage={message:"",isExpired:false};
      if (promotionHasStarted)
      {
        promoMessage.message+=" Ends in: ";
      }
      else
      {
        promoMessage.message+=" Starts in: ";
      }

      if (daysDiff!=0)
      {
        promoMessage.message+=daysDiff+ " day(s) ";
      }

      promoMessage.message+=this.formT(hoursDiff)+":"+this.formT(minutesDiff);//+":"+this.formT(secondsDiff);
      
      this.promoMessages[promo.key]=promoMessage;

      return true;

}

getPromotionMessage(promo:Promotion):string
{
 if (this.promoMessages[promo.key]==null)
  return "";
  return this.promoMessages[promo.key].message;
}

isPromotionExpired(promo:Promotion):boolean
{
  if (this.promoMessages[promo.key]==null)
  return false;
  return this.promoMessages[promo.key].isExpired;
}


public startPromotion(promo:Promotion)
{
  promo.isActivated=true;
   this.updatePromotionToCurrentUser(promo);
}

public stopPromotion(promo:Promotion)
{
  promo.isActivated=false;
  this.updatePromotionToCurrentUser(promo);
 
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

    if ((startH>endH)||((startH==endH)&&((startM>endM)))) //promotion not in same day
    {
      nowDate=new Date(nowDate.valueOf()-(1000 * 60 * 60 * 24))
    }

    let nowD:number=nowDate.getDay()+1;
    let i=0;
    
    if (checkForNext)
    {
      i=1;
    }

    
 
   
    while (i<=7 && daysToAddToToday==-1)
    {
      
      if (promo.days[(nowD+i)%7])
      {
        daysToAddToToday=i;
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
