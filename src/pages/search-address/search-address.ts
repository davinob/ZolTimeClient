import { Component,ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams,ViewController } from 'ionic-angular';

import { TextInput } from 'ionic-angular/components/input/input';
import { AddressService } from '../../providers/address-service';

import { Storage } from '@ionic/storage';
import { AlertAndLoadingService } from '../../providers/alert-loading-service';
import { firestore } from 'firebase/app';
import { UserService, SearchSettings } from '../../providers/user-service';
import { fromEvent, interval } from 'rxjs';

import { debounceTime,map } from 'rxjs/operators';


@IonicPage()
@Component({
  selector: 'page-search-address',
  templateUrl: 'search-address.html',
})
export class SearchAddressPage {



  @ViewChild('address') addressInput:TextInput=null;
  searchAddress: string = '';
  addresses: any=[];
 
  searching:boolean=false;
  addressSelected:boolean=false;
  

  tmpDescription:any=null;

  settings:SearchSettings;

  constructor(public navCtrl: NavController, public navParams: NavParams, 
    public addressService:AddressService,
    private viewCtrl:ViewController,
    private alertLoadingService:AlertAndLoadingService,
    private userService:UserService) {
      this.settings=this.userService.userSearchSettings;

  }


  clearAddressesHistory()
  {
    this.alertLoadingService.showChoice('Are you sure you want to remove all search address history?',"NO","YES").then(val=>
      {
        if (val)
        {
          this.addressService.clearAddressesHistory();
        }
      });

  }



  ionViewDidEnter() {
    this.settings.position.description="";
    this.tmpDescription="";
    console.log(this.settings.position);

    console.log('ionViewDidLoad SearchAddressPage');
  console.log("addressInput");
  console.log(this.addressInput);

  this.addressService.loadHistory();
  

    
  if (this.addressInput)
  {
    
    
  fromEvent(this.addressInput.getNativeElement(), 'keyup')
  .pipe(map((x:any) => x.currentTarget.value)).pipe(
  debounceTime(400)).subscribe((x:any) => {
    this.setFilteredItems();}
  );
  }

  interval(200)
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
  this.alertLoadingService.dismissLoading();
}

  lastStringTyped:string="";

  async setFilteredItems() {
    console.log("FILTERING ADDRESSES");
    console.log(this.lastStringTyped);
    console.log(this.searchAddress);
    if ((this.searchAddress==null)||(this.searchAddress.length<2)
    )
    {
      this.addressSelected=false;
      this.addresses=[];
      console.log("NOT DOING SEARCH AGAIN!");
      return;
    }
    

    this.lastStringTyped=this.searchAddress;
    
      this.searching=true;
      this.addressSelected=false;

      let sellersNamesFiltered=this.userService.getAllSellersWithSearchTerm(this.searchAddress);
      this.addresses=sellersNamesFiltered;
      
      try{


      let promSearch=this.userService.searchAddressesAndSellers(this.searchAddress,sellersNamesFiltered);
      
      
      let timeOutPromise=new Promise((resolve)=>{
        setTimeout(resolve,150000,[])});

        let listOfAddresses=await Promise.race([promSearch,timeOutPromise]);

         this.addresses=listOfAddresses;
      }
      catch(error)
      {
        console.log(error);
        this.alertLoadingService.showToast({message:"  אירעה שגיאה בעת החיבור לשרת."});
        this.searching=false;
      }
      this.searching=false;

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
    this.userService.userSearchSettings=this.settings;
  
    this.navCtrl.pop();
    }
    else
    {
      this.navCtrl.push("SellerPage",{sellerKey:position.key}).then(()=>
      {
        console.log("REMOVING ADDRES VIEW");
        // first we find the index of the current view controller:
        const index = this.viewCtrl.index;
        console.log(index);
        // then we remove it from the navigation stack
        this.navCtrl.remove(index);

      });
    }
    
  }

  selectAddress(place:any)
  {
    console.log("SELECT ADDRESS" + place.description);
    this.addresses=[];
    this.searchAddress=place.description;
    this.lastStringTyped=this.searchAddress;
    this.addressSelected=true;

  
  if (place.isAddress) 
  {
    this.addressService.getPositionAddress(place).first().subscribe((address)=>
    {
        console.log(address);
    
        this.settings.position.geoPoint=address.geoPoint;
        this.settings.position.description=address.description;
        this.addressService.addAddressToHistory(this.settings.position); 
        this.userService.filterSellersAndGetTheirProdsAndDeals(this.settings);
        this.navCtrl.pop();
    });
  }
  else
  {
    this.addressService.addAddressToHistory(place);
    this.navCtrl.push("SellerPage",{sellerKey:place.key,cameFromAddressSearch:true}).then(()=>
    {
      console.log("REMOVING ADDRES VIEW");
      // first we find the index of the current view controller:
      const index = this.viewCtrl.index;
      console.log(index);
      // then we remove it from the navigation stack
      this.navCtrl.remove(index);

    });
  }

   this.addressInput.setFocus();
    
  }

}
