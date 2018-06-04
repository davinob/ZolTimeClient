import { Component} from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { SearchSettings, UserService } from '../../providers/user-service';


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

  constructor(public navCtrl: NavController, public navParams: NavParams, public storage:Storage,
    private userService:UserService) {
    console.log('constructore SearchSettingsPage');
    this.settings=this.navParams.data.settings;
  
  }

    hashgahot:string[]=["Any","Kosher","Lemehadrin"];
    rangeMin:number=0;
    rangeMax:number=50;
    




  ionViewDidLoad() {
    
    console.log('ionViewDidLoad SearchSettingsPage');
    this.settings=this.navParams.data.settings;
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
  this.storage.set("settings",this.settings);
  this.userService.getClosestCurrentSellers(this.settings);
}
  },1000);
}



}
