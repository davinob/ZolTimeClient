import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';


/**
 * Generated class for the SearchSettingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */



export interface SearchSettings {
  hashgaha: string;
  range:string;
  order:string;
  onlyShowPromotion:boolean
  }


@IonicPage()
@Component({
  selector: 'page-search-settings',
  templateUrl: 'search-settings.html',
})
export class SearchSettingsPage {

  settingsToSet:SearchSettings;

  constructor(public navCtrl: NavController, public navParams: NavParams, public storage:Storage) {
    
    this.settingsToSet=this.navParams.data.settings;
 

  
  }

    hashgahot:string[]=["Any","Kosher","Lemehadrin"];
    ranges:string[]=["1 Km","5 Km","10 Km","20 Km"];
    orders:string[]=["Low Price","High Price","Low Promotion","High Promotion"];

  ionViewDidLoad() {
    
    console.log('ionViewDidLoad SearchSettingsPage');
    
      console.log(this.navParams.data.settings);
      console.log(this.navParams);
     
      console.log(this.settingsToSet);
      this.initSearchSettingsFromStorage();
   }

 

  initSearchSettingsFromStorage() {
    console.log(this.settingsToSet);

    this.storage.get("settingsToSet").then(val => {
      if (val)
      {
        this.settingsToSet=val;
      }
        console.log(this.settingsToSet);
     });

  
  }

updateStorage()
{
  this.storage.set("settingsToSet",this.settingsToSet);
}



}
