import { Injectable } from '@angular/core';
import { Http  } from '@angular/http';


import * as firebase from 'firebase/app';
import { firestore } from 'firebase/app';
import { Subject, Observable } from 'rxjs';

import { map,first } from 'rxjs/operators';
import { Storage } from '@ionic/storage';
import * as fbConfig from './../providers/fbConfig'; 


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
    //let searchUrl:string="https://maps.googleapis.com/maps/api/geocode/json?latlng="+lat+","+lng+"&language=iw&key=" +fbConfig.apiKey;
    
    let searchUrl:string="https://nominatim.openstreetmap.org/reverse?format=json&lat="+lat+"&lon="+lng+"&zoom=18&addressdetails=1";

    console.log("SEARCH URL before timeout:"+searchUrl); 
    setTimeout(
      ()=>{
      return "אין מיקום";
      }, 150000);
    
      console.log("SEARCH URL:"+searchUrl);

    let addressesResponse=await this.http.get(searchUrl);
    
    let addressResp= await addressesResponse.pipe(map(res => res.json())).pipe(first()).toPromise();
    
  
    console.log(addressResp);

     

       
      
            let address_components=addressResp.address;
            let address="",streetNumber=address_components.house_number,street=address_components.road,city=address_components.town;
            if (!city)
            {
              city=address_components.city;
            }

            if (streetNumber)
            address=street+" "+streetNumber+", "+city ;
            else if (street)
            address=street+", "+city ;
            else
            address=city ;

            console.log(address);

            return address;
   
        
  

    

  }
  


  async searchAddresses(searchTerm:string)
  { 

    let  csvUrl = 'assets/streets/streets.csv';

   searchTerm=searchTerm.trim();

     let dataT=await this.http.get(csvUrl).toPromise();

     console.log("AUTOCOMPLETE");

            let wholeText=dataT.text();
            let arr=wholeText.split("\n");
            let numReturned=0;

            let searchTermStreet=searchTerm.split(",")[0];
            if (searchTermStreet)
            searchTermStreet=searchTermStreet.trim();

            let searchTermCity=searchTerm.split(",")[1];
            if (searchTermCity)
            searchTermCity=searchTermCity.trim();
            

            let searchTermStreetWithoutNumber=searchTermStreet.replace(/[0-9]/g, '');
            console.log("Without number:");
            searchTermStreetWithoutNumber=searchTermStreetWithoutNumber.trim();
             console.log(searchTermStreetWithoutNumber);

             let newAddresses=new Array<any>();

            arr.filter(val=>{
               if (val.indexOf(searchTermStreetWithoutNumber)==-1 || numReturned>5)
                {
                return false;
                }
            
                if (searchTermCity)
                {
                  if ((! val.split(",")[1]) || (val.split(",")[1].indexOf(searchTermCity)==-1))
                  {
                    return false;
                  } 
                }

                numReturned++;
                return true;
            }
              ).map(val=>
                {
                  if (searchTermStreetWithoutNumber!=searchTermStreet)
                  {
                    console.log(val);
                    let values=val.split(",");
                    console.log(values);
                    console.log(values[1]);
                    if (values[1])
                    {
                      val=searchTermStreet+","+values[1];
                    }
                  }
                  return val.trim();

                }).filter((elem, index, self)=> { //removing duplicates
                  return index === self.indexOf(elem);
                }).forEach(val=>
                  {
                  
                  let address={description:val,isAddress:true};
                  newAddresses.push(address);
                  console.log(address);
                  }
                  );

                  console.log("SEARCHED ADDRESSES SERVICE");
                  console.log(newAddresses);

              

                  return newAddresses; 

/*
      if (1==1)
        return new Array<any>();

    let searchUrl:string="https://maps.googleapis.com/maps/api/place/autocomplete/json?input="+searchTerm+"&types=geocode&components=country:il&language=iw&key="+fbConfig.apiKey;
    
    

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
    
    */
  }
  
  
  async getPositionAddress(place)
  {
   
    console.log(place);
    let searchUrl:string="https://nominatim.openstreetmap.org/search?q="+place.description+"&format=json&polygon=1&addressdetails=1&countrycodes=IL";


    //let searchUrl:string="https://maps.googleapis.com/maps/api/place/details/json?placeid="+placeID+"&key="+fbConfig.apiKey;
    
    console.log(searchUrl);
     let data= await this.http.get(searchUrl).pipe(map(res => res.json())).pipe(first()).toPromise();
     
   
      let address:Address=<Address>{};

      console.log(data);
      let resAddress=data[0];
      
      if (!resAddress)
      {
        throw new Error(" כתובת לא נמצאת, נא לבדוק חיבור לשרת או לשנות כתובת");
      }
      
      address.geoPoint=new firebase.firestore.GeoPoint(Number(resAddress.lat),Number(resAddress.lon));

      address.description=place.description;

      return address;
   
      
    
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
 // console.log("CHECK DISTANCE CORRECT");
 // console.log(geoPoint1);
 // console.log(geoPoint2);
 // console.log(this.distance(geoPoint1,geoPoint2));
 // console.log(maxDistance);

  return this.distance(geoPoint1,geoPoint2)<=maxDistance;
}



loadHistory()
{
  this.getAddressesHistory().then(val=>{
  // console.log("ADDRESSES HIST");
 //  console.log(val);
   this.addressesHistory=val;
  });
}


clearAddressesHistory()
{
 
     // console.log("CLEARING HISTORY");
      this.storage.set('locations',new Array());
      this.addressesHistory=new Array();
  
}



async addAddressToHistory(position:any)
{
 // console.log("POSITION");
 // console.log(position);
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
let placesFromHistory=await this.getAddressesHistory();
  if(!placesFromHistory)
 placesFromHistory=new Array<any>();
 
 console.log("history from storage");
 console.log(placesFromHistory);
 console.log(posToSave);

//if same address already in the list, we won't add it:

  for (let index = 0; index < placesFromHistory.length; index++) {
    const place = placesFromHistory[index];

    if (this.areSamePlaces(posToSave,place))
    {
      this.putHistoryAddressToFirstPlace(posToSave);
      return;
    }
  
  }  
 
placesFromHistory.unshift(posToSave);
if (placesFromHistory.length>=10)
  placesFromHistory.pop();

  this.saveAddressesHistory(placesFromHistory);

}


saveAddressesHistory(placesFromHistory)
{
  this.storage.set('locations',placesFromHistory );
}

areSamePlaces(place1,place2):boolean
{
  if (place1.isAddress)
    {
    if ((place2.description==place1.description)||(place2.lat==place1.lat)&&(place2.lng==place1.lng))
    {
      return true;
    }
    }
    else
    {
      if (place2.key==place1.key)
      {
        return true;
      }
    }
}



async putHistoryAddressToFirstPlace(position)
{
  let addressesHistory=await this.getAddressesHistory();
  
  addressesHistory=addressesHistory.filter(place=>{return !this.areSamePlaces(place,position)});

  addressesHistory.unshift(position);

  await this.saveAddressesHistory(addressesHistory);
}


getAddressesHistory():Promise<any[]>
{
  return this.storage.get('locations');
  
}


 
}
