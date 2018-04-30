import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { SearchSettings } from '../../providers/user-service';


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

  constructor(public navCtrl: NavController, public navParams: NavParams, public storage:Storage) {
    console.log('constructore SearchSettingsPage');
    this.settings=this.navParams.data.settings;
  
  }

    hashgahot:string[]=["Any","Kosher","Lemehadrin"];
    rangeMin:number=0;
    rangeMax:number=50;
    orders:string[]=["Low Price","High Price","Low Promotion","High Promotion"];




  ionViewDidLoad() {
    
    console.log('ionViewDidLoad SearchSettingsPage');
    this.settings=this.navParams.data.settings;
   }

 

  

updateStorage()
{
  this.storage.set("settings",this.settings);
}



}
