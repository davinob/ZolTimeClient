import { Component,ViewChild,ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { TextInput } from 'ionic-angular/components/input/input';
import { Address, AddressService } from '../../providers/address-service';
import { Observable } from 'rxjs/Observable';

import { Geolocation } from '@ionic-native/geolocation';
import { Storage } from '@ionic/storage';
import { AlertAndLoadingService } from '../../providers/alert-loading-service';

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
  

  position:any=null;
  tmpDescription:any=null;


  constructor(public navCtrl: NavController, public navParams: NavParams, 
    private geolocation: Geolocation,
    public addressService:AddressService,
    private storage: Storage,
    private alertLoadingService:AlertAndLoadingService) {

  }

  loadHistory()
  {
    this.getAddressesHistory().then(val=>{
     console.log("ADDRESSES HIST");
     console.log(val);
      this.addressesHistory=val.filter((val,index)=>{
        return index<5;
      });
    });
  }
  
 

  ionViewDidLoad() {
    


    this.position=this.navParams.data.position;
    this.position.description="";
    this.tmpDescription="";
    console.log(this.position);

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
    ||(this.lastStringTyped==this.searchAddress))
    {
      if ((this.searchAddress==null)||(this.searchAddress.length<2))
        {
          this.addressSelected=false;
        }
      this.addresses=null;
      return;
    }
    this.lastStringTyped=this.searchAddress;
      this.searching=true;
      this.addressSelected=false;
      this.addressService.filterItems(this.searchAddress).first().subscribe((listOfAddresses)=>
      {
         this.searching=false;
         this.addresses=listOfAddresses.value;
      });

  }

  getAddressesHistory():Promise<string[]>
  {
    return this.storage.get('locations');
    
  }

  addAddressToHistory(position:any)
  {
  // Or to get a key/value pair
  this.getAddressesHistory().then((val) => {
   console.log("history from storage");
   console.log(val);
    if(!val)
   val=new Array();
  val.unshift(position);
  this.storage.set('locations',val );
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
    console.log(position);
    this.position.lat=position.lat;
    this.position.lon=position.lon;
    this.position.description=position.description;
    this.navCtrl.pop();

  }

  selectAddress(address:any)
  {
    console.log("SELECT ADDRESS" + address.description);
    this.addresses=null;
    this.searchAddress=address.description;
    this.lastStringTyped=this.searchAddress;
    this.addressSelected=true;

  
    
    this.addressService.getPosition(address.place_id).first().subscribe((addressJSON)=>
    {
        console.log(addressJSON);
        console.log(address);

        this.position.lat=addressJSON.value.lat;
        this.position.lon=addressJSON.value.lng;

        let description="";

        if (addressJSON.value.street)
        description+=addressJSON.value.street;

        if (addressJSON.value.streetNumber)
          {
            if (description!="")
              description+=" ";
            description+=addressJSON.value.streetNumber+" ";
          }

        if (addressJSON.value.city)
        {
          if (description!="")
            description+=", ";
          description+=addressJSON.value.city;
        }
        
  
        this.position.description=description;
        this.addAddressToHistory(this.position);


        this.navCtrl.pop();




    });
    
   this.addressInput.setFocus();
    
  }

}
