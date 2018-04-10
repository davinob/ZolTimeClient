import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

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

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SearchSettingsPage');
  }

  settingsToSet:any=null;

  ngOnInit() {
    if (this.navParams.data) {
     console.log(this.navParams.data);
     console.log(this.navParams);
     this.settingsToSet=this.navParams.data;
    }
  }


  hashgahot:string[]=["Any","Kosher","Lemehadrin"];
  ranges:string[]=["1 Km","5 Km","10 Km","20 Km"];

}
