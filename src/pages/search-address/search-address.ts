import { Component,ViewChild,ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { TextInput } from 'ionic-angular/components/input/input';
import { Position,Address, AddressService } from '../../providers/address-service';
import { Observable } from 'rxjs/Observable';

import { Geolocation } from '@ionic-native/geolocation';
import { Storage } from '@ionic/storage';
import { AlertAndLoadingService } from '../../providers/alert-loading-service';
import { firestore } from 'firebase/app';
import { UserService, SearchSettings } from '../../providers/user-service';

/**
 * Generated class for the SearchAddressPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-search-address',
  templateUrl: 'search-address.html',
})
export class SearchAddressPage {



  @ViewChild('address') addressInput:TextInput=null;
  searchAddress: string = '';
  addresses: any;
  addressesHistory: string[];
  searching:boolean=false;
  addressSelected:boolean=false;
  

  tmpDescription:any=null;

  settings:SearchSettings;

  constructor(public navCtrl: NavController, public navParams: NavParams, 
    private geolocation: Geolocation,
    public addressService:AddressService,
    private storage: Storage,
    private alertLoadingService:AlertAndLoadingService,
    private userService:UserService) {
      this.settings=this.userService.userSearchSettings;

  }

  loadHistory()
  {
    this.getAddressesHistory().then(val=>{
     console.log("ADDRESSES HIST");
     console.log(val);
     this.addressesHistory=val;
    });
  }
  
 



  ionViewDidEnter() {
    this.settings.position.description="";
    this.tmpDescription="";
    console.log(this.settings.position);

    console.log('ionViewDidLoad SearchAddressPage');
  console.log("addressInput");
  console.log(this.addressInput);

  this.loadHistory();
  

    
  if (this.addressInput)
  {
    
    
  Observable
  .fromEvent(this.addressInput.getNativeElement(), 'keyup')
  .map((x:any) => x.currentTarget.value)
  .debounceTime(400).subscribe((x:any) => {
    this.setFilteredItems();}
  );
  }

  Observable
  .interval(200)
  .subscribe(x=>
    {
      this.addressInput.setFocus();
    }
  );
  

}

clearAddressSearch(){
  this.searchAddress="";
  this.addresses=new Array();
  this.searching=false;
}

  lastStringTyped:string="";

  setFilteredItems() {
    console.log("FILTERING ADDRESSES");
    console.log(this.lastStringTyped);
    console.log(this.searchAddress);
    if ((this.searchAddress==null)||(this.searchAddress.length<2)
    )
    {
      this.addressSelected=false;
      this.addresses=null;
      console.log("NOT DOING SEARCH AGAIN!");
      return;
    }
    

    this.lastStringTyped=this.searchAddress;
      this.searching=true;
      this.addressSelected=false;

      let sellersNamesFiltered=this.userService.getAllSellersWithSearchTerm(this.searchAddress);
      this.addresses=sellersNamesFiltered;
      
      this.userService.searchAddressesAndSellers(this.searchAddress,sellersNamesFiltered).then((listOfAddresses)=>
      {
         this.searching=false;
         this.addresses=listOfAddresses;
      });

  }

  getAddressesHistory():Promise<any[]>
  {
    return this.storage.get('locations');
    
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
      if ((place.lat==posToSave.lat)&&(place.lng==posToSave.lng))
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


  clearAddressesHistory()
  {
    this.alertLoadingService.showChoice('Are you sure you want to remove all search address history?',"NO","YES").then(val=>
    {
      if (val)
      {
        console.log("CLEARING HISTORY");
        this.storage.set('locations',new Array());
        this.addressesHistory=new Array();
      }
    });
  }


  selectAddressFromHistory(position:any)
  {
    this.addresses=null;
    this.searchAddress=position.description;
    
    
    if (position.isAddress)
    {
    console.log(position);
    this.settings.position.description=position.description;
    this.settings.position.geoPoint=new firestore.GeoPoint(position.lat,position.lng);
    this.userService.filterSellersAndGetTheirProdsAndDeals(this.settings);
    this.navCtrl.pop();
    }
    else
    {
      this.navCtrl.setRoot("SellerPage",{sellerKey:position.key});
    }
    
  }

  selectAddress(place:any)
  {
    console.log("SELECT ADDRESS" + place.description);
    this.addresses=null;
    this.searchAddress=place.description;
    this.lastStringTyped=this.searchAddress;
    this.addressSelected=true;

  
  if (place.isAddress) 
  {
    this.addressService.getPositionAddress(place.place_id).first().subscribe((address)=>
    {
        console.log(address);
    
        this.settings.position.geoPoint=address.geoPoint;
        this.settings.position.description=address.description;
        this.addAddressToHistory(this.settings.position); 
        this.userService.filterSellersAndGetTheirProdsAndDeals(this.settings);
        this.navCtrl.pop();
    });
  }
  else
  {
    this.addAddressToHistory(place);
    this.navCtrl.setRoot("SellerPage",{sellerKey:place.key});
  }

   this.addressInput.setFocus();
    
  }

}
