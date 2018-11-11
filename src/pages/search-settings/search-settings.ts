import { Component} from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { SearchSettings, UserService } from '../../providers/user-service';
import { AddressService } from '../../providers/address-service';


/**
 * Generated class for the SearchSettingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */






@IonicPage()
@Component({
  selector: 'page-search-settings',
  templateUrl: 'search-settings.html',
})
export class SearchSettingsPage {

  
  settings:SearchSettings=null;
  previousSearchSettings:SearchSettings=null;

  constructor(public navCtrl: NavController, public navParams: NavParams, public storage:Storage,
    private userService:UserService,
  private addressService:AddressService) {
    console.log('constructore SearchSettingsPage');
    this.settings=this.userService.cloneSettings();
    this.previousSearchSettings=this.userService.cloneSettings();
  
  }

    hashgahot:string[]=["Any","Kosher","Lemehadrin"];
    rangeMin:number=0;
    rangeMax:number=10;
    




  ionViewDidLoad() {
    console.log('ionViewDidLoad SearchSettingsPage');
    
   }

 

  
lastTime:number=0;


updateStorageAndSearch()
{


  this.lastTime=new Date().getTime();

  setTimeout(
    ()=>{
let now=new Date().getTime();
if (now-this.lastTime>=1000)
{ 
  if (this.areSearchSettingTheSame())
  {
    console.log("SAME SETTINGS");
   return;
  }
  console.log("NOT SAME SETTINGS") ;
  console.log(this.settings) ;

  this.storage.set("settings",this.settings);
  this.previousSearchSettings=this.userService.cloneSettings();
  this.userService.filterSellersAndGetTheirProdsAndDeals(this.settings);
}
  },1000);
}


 




areSearchSettingTheSame():boolean
  {
    

    console.log(this.settings);
    console.log(this.previousSearchSettings);

    if (this.previousSearchSettings==null&&this.settings!=null)
      return false;
   
    if (this.settings.position)
    {
      if (this.settings.position.description!=this.previousSearchSettings.position.description)
      return false;
      if (this.settings.position.geoPoint){
      if (this.settings.position.geoPoint.latitude!=this.previousSearchSettings.position.geoPoint.latitude)
      return false;
      if (this.settings.position.geoPoint.longitude!=this.previousSearchSettings.position.geoPoint.longitude)
      return false;
      }
    }

 
    if (this.settings.hashgaha && this.settings.hashgaha!=this.previousSearchSettings.hashgaha)
     return false;

    if (this.settings.range &&  this.settings.range!=this.previousSearchSettings.range)
      return false;

   if (this.settings.onlyShowPromotion!=this.previousSearchSettings.onlyShowPromotion)
      return false;
   
  
    return true;
  }



}
