import { Injectable } from '@angular/core';
import { Http  } from '@angular/http';


import * as firebase from 'firebase/app';
import { firestore } from 'firebase/app';
import { Subject, Observable } from 'rxjs';

import { map,first } from 'rxjs/operators';
import { Storage } from '@ionic/storage';


export interface Address{
    geoPoint:firebase.firestore.GeoPoint;
   streetNumber:number;
   street:string;
   city:string;
   description:string
}

export interface Position{
  geoPoint:firebase.firestore.GeoPoint;
  description:string;
  isAddress:boolean
}

@Injectable()
export class AddressService{
  
 
  addressesHistory: string[];


  constructor( public http: Http,private storage: Storage) {
  }
  
  createPosition(lat:number,lng:number,description:string):Position
  {
    return {geoPoint:new firebase.firestore.GeoPoint(lat,lng),description:description,isAddress:true};
  }

  async createPositionWithCurrentLocation(lat:number,lng:number)
  {
    let description =await this.findAddressDescriptionFromLatLng(lat,lng);
      console.log("THE DESC RETRIEVED");
      console.log(description);
      let position:Position= {geoPoint:new firebase.firestore.GeoPoint(lat,lng),description:description,isAddress:true};

      this.addAddressToHistory(position);

      return position;

  }

  async findAddressDescriptionFromLatLng(lat:number,lng:number):Promise<string>
  {
    let searchUrl:string="https://maps.googleapis.com/maps/api/geocode/json?latlng="+lat+","+lng+"&key="+this.key;
    
    console.log("SEARCH URL before timeout:"+searchUrl); 
    setTimeout(
      ()=>{
      return "אין מיקום";
      }, 150000);
    
      console.log("SEARCH URL:"+searchUrl);

    let addressesResponse=await this.http.get(searchUrl);
    
    let addressResp= await addressesResponse.pipe(map(res => res.json())).pipe(first()).toPromise();
    
  
    console.log(addressResp);

        let results=addressResp.results;
        for(let j=0;j<results.length;j++)
        {
          if (results[j].formatted_address)
          {
            console.log(results[j].formatted_address);
            return results[j].formatted_address
          }
        }
  

    

  }
  
  key:string="AIzaSyBrurdvN-JkU18waDg-_TidMJNKd75p3Ls";
      
  async searchAddresses(searchTerm:string)
  {
    let searchUrl:string="https://maps.googleapis.com/maps/api/place/autocomplete/json?input="+searchTerm+"&types=geocode&components=country:il&language=iw&key="+this.key;
    
    

    console.log("SEARCH URL before timeout:"+searchUrl); 
      setTimeout(
        ()=>{
        return []
        }, 150000);
      
        console.log("SEARCH URL:"+searchUrl);

      let results=await this.http.get(searchUrl);
      console.log("THE RESULTS");
      console.log(results);
      
      

      let data=await results.pipe(map(res => res.json())).pipe(first()).toPromise();
      console.log("THE DATA");
      console.log(data);

      let newAddresses=data.predictions.filter((address) => {
          return address.description.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;
        }).map(address=>{
          let descTmp="";
         for (let i=0; i<address.terms.length-1;i++)
         {
          console.log(address.terms[i]);
          if (i==address.terms.length-2 && i>0)
          descTmp+=", ";
          descTmp+=address.terms[i].value+" ";
          

      
         }
         address.description=descTmp;
          address.isAddress=true;
          return address;
      });

      console.log("SEARCHED ADDRESSES SERVICE");
      console.log(newAddresses);
        return newAddresses;
    
    
  }
  
  
  getPositionAddress(place):Observable<Address>
  {
    let placeID=place.place_id;
    
    let searchUrl:string="https://maps.googleapis.com/maps/api/place/details/json?placeid="+placeID+"&key="+this.key;
    let addressPos:Subject<any>=new Subject<any>();

     this.http.get(searchUrl).pipe(map(res => res.json())).subscribe(data => {
      let address:Address=<Address>{};

      console.log("POSITION OF ADDRESS AND OTHER INFO");
      console.log(data);
     for (let addressComp of data.result.address_components) {
       if (addressComp.types[0]=="street_number")
         address.streetNumber=addressComp.long_name;
   
       if (addressComp.types[0]=="route")
         address.street=addressComp.long_name;
      
       if (addressComp.types[0]=="locality")
         address.city=addressComp.long_name;
      }
      
      address.geoPoint=new firebase.firestore.GeoPoint(data.result.geometry.location.lat,data.result.geometry.location.lng);
      console.log(data.result.geometry.location.lat);
      console.log(data.result.geometry.location.lng);
      console.log("GEO POINT FROM ADDRESS");
      console.log(address.geoPoint);

      address.description=place.description;

      addressPos.next(address);
      
     
     },
    err=>{
    console.log(err);
    }
    );
 
    return addressPos.asObservable();
  }


 


 
  distance(location1:firestore.GeoPoint, location2:firestore.GeoPoint):number {
    const radius = 6371; // Earth's radius in kilometers
    const latDelta = this.degreesToRadians(location2.latitude - location1.latitude);
    const lonDelta = this.degreesToRadians(location2.longitude - location1.longitude);
  
    const a = (Math.sin(latDelta / 2) * Math.sin(latDelta / 2)) +
            (Math.cos(this.degreesToRadians(location1.latitude)) * Math.cos(this.degreesToRadians(location2.latitude)) *
            Math.sin(lonDelta / 2) * Math.sin(lonDelta / 2));
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    return radius * c;
  }

 degreesToRadians(degrees:number):number {
   return (degrees * Math.PI)/180;}


 wrapLongitude(longitude:number):number {
  if (longitude <= 180 && longitude >= -180) {
    return longitude;
  }
  const adjusted = longitude + 180;
  if (adjusted > 0) {
    return (adjusted % 360) - 180;
  }
  // else
  return 180 - (-adjusted % 360);
}


metersToLongitudeDegrees(distance:number, latitude:number):number {
  const EARTH_EQ_RADIUS = 6378137.0;
  // this is a super, fancy magic number that the GeoFire lib can explain (maybe)
  const E2 = 0.00669447819799;
  const EPSILON = 1e-12;
  const radians = this.degreesToRadians(latitude);
  const num = Math.cos(radians) * EARTH_EQ_RADIUS * Math.PI / 180;
  const denom = 1 / Math.sqrt(1 - E2 * Math.sin(radians) * Math.sin(radians));
  const deltaDeg = num * denom;
  if (deltaDeg < EPSILON) {
    return distance > 0 ? 360 : 0;
  }
  // else
  return Math.min(360, distance / deltaDeg);
}


boundingBoxCoordinates(center:firestore.GeoPoint, radius:number):any {
  const KM_PER_DEGREE_LATITUDE = 110.574;
  const latDegrees = radius / KM_PER_DEGREE_LATITUDE;
  const latitudeNorth = Math.min(90, center.latitude + latDegrees);
  const latitudeSouth = Math.max(-90, center.latitude - latDegrees);
  // calculate longitude based on current latitude
  const longDegsNorth = this.metersToLongitudeDegrees(radius, latitudeNorth);
  const longDegsSouth = this.metersToLongitudeDegrees(radius, latitudeSouth);
  const longDegs = Math.max(longDegsNorth, longDegsSouth);
  return {
    swCorner: { // bottom-left (SW corner)
      latitude: latitudeSouth,
      longitude: this.wrapLongitude(center.longitude - longDegs),
    },
    neCorner: { // top-right (NE corner)
      latitude: latitudeNorth,
      longitude:this. wrapLongitude(center.longitude + longDegs),
    },
  };
}

isGeoPointNotSoFar(geoPoint1:firestore.GeoPoint,geoPoint2:firestore.GeoPoint,maxDistance:any):boolean
{
  console.log("CHECK DISTANCE CORRECT");
  console.log(geoPoint1);
  console.log(geoPoint2);
  console.log(this.distance(geoPoint1,geoPoint2));
  console.log(maxDistance);

  return this.distance(geoPoint1,geoPoint2)<=maxDistance;
}



loadHistory()
{
  this.getAddressesHistory().then(val=>{
   console.log("ADDRESSES HIST");
   console.log(val);
   this.addressesHistory=val;
  });
}


clearAddressesHistory()
{
 
      console.log("CLEARING HISTORY");
      this.storage.set('locations',new Array());
      this.addressesHistory=new Array();
  
}



addAddressToHistory(position:any)
{
  console.log("POSITION");
  console.log(position);
  let posToSave:any={};
  posToSave={
    description:position.description,
  };

  if (!position.isAddress)
  {
    posToSave["address"]=position.address;
    posToSave["key"]=position.key;
    posToSave["isAddress"]=false;
  }
else
{
  posToSave["lat"]=position.geoPoint.latitude;
  posToSave["lng"]=position.geoPoint.longitude;
  posToSave["isAddress"]=true;

}

console.log("POS BEING SAVED");
console.log(posToSave);

// Or to get a key/value pair
this.getAddressesHistory().then((placesFromHistory) => {
  if(!placesFromHistory)
 placesFromHistory=new Array<any>();
 
 console.log("history from storage");
 console.log(placesFromHistory);
 console.log(posToSave);

//if same address already in the list, we won't add it:
if (posToSave.isAddress)
{
  for (let index = 0; index < placesFromHistory.length; index++) {
    const place = placesFromHistory[index];
    if ((place.description==posToSave.description)||(place.lat==posToSave.lat)&&(place.lng==posToSave.lng))
    {
      console.log("NO NEED TO SAVE");
      //no need to save the place
      return;
    }
  }  
}  
else
{
  for (let index = 0; index < placesFromHistory.length; index++) {
    const place = placesFromHistory[index];
    if (place.key==posToSave.key)
    {
      console.log("NO NEED TO SAVE");
      //no need to save the place
      return;
    }
  }  
}



 
placesFromHistory.unshift(posToSave);
if (placesFromHistory.length>=10)
  placesFromHistory.pop();
this.storage.set('locations',placesFromHistory );
});
}




getAddressesHistory():Promise<any[]>
{
  return this.storage.get('locations');
  
}


 
}
