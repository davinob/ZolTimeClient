import { Injectable } from '@angular/core';
import { Http  } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import * as firebase from 'firebase/app';
import { firestore } from 'firebase/app';

export interface Address{
    geoPoint:firebase.firestore.GeoPoint;
   streetNumber:number;
   street:string;
   city:string;
   description:string
}

export interface Position{
  geoPoint:firebase.firestore.GeoPoint;
  description:string
}

@Injectable()
export class AddressService{
  
 

  constructor( public http: Http) {
  }
  
  createPosition(lat:number,lng:number,description:string):Position
  {
    return {geoPoint:new firebase.firestore.GeoPoint(lat,lng),description:description};
  }
  
  key:string="AIzaSyDXH1P9t_7NbM4xKUptwQ47YjNYSosLi_k";
      
  filterItems(searchTerm:string):Observable<any>
  {
    let searchUrl:string="https://maps.googleapis.com/maps/api/place/autocomplete/json?input="+searchTerm+"&types=geocode&components=country:il&language=iw&key="+this.key;
    let allAddresses:Subject<any>=new Subject<any>();

     this.http.get(searchUrl).map(res => res.json()).subscribe(data => {
      let newAdd=data.predictions.filter((address) => {
        return address.description.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;
      });
      console.log("NEW ADDRESS:");
      console.log(newAdd);
      
      allAddresses.next({value:newAdd});
     },
    err=>{
    console.log(err);
    }
    );
   return allAddresses.asObservable();

  }
  
  
  getPositionAddress(placeID:string):Observable<Address>
  {
    let searchUrl:string="https://maps.googleapis.com/maps/api/place/details/json?placeid="+placeID+"&key="+this.key;
    let addressPos:Subject<any>=new Subject<any>();

     this.http.get(searchUrl).map(res => res.json()).subscribe(data => {
      let address:Address=<Address>{};
      
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

      this.setAddressDescription(address);

      addressPos.next(address);
      
     
     },
    err=>{
    console.log(err);
    }
    );
 
    return addressPos.asObservable();
  }


  setAddressDescription(address:Address)
  {
    let description:string="";

    if (address.street)
    description+=address.street;

    if (address.streetNumber)
      {
        if (description!="")
          description+=" ";
        description+=address.streetNumber+" ";
      }

    if (address.city)
    {
      if (description!="")
        description+=", ";
      description+=address.city;
    }

    address.description=description;
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
 
}
