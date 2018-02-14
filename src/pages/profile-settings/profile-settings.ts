import { Component,ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams,LoadingController, 
  Loading} from 'ionic-angular';
import { AuthService } from '../../providers/auth-service';

import { LoginPage } from '../login/login';
import { UserService, User } from '../../providers/user-service';
import { AlertAndLoadingService } from '../../providers/alert-loading-service';
import { Observable } from 'rxjs/Observable';

import { Camera } from '@ionic-native/camera';


import { AddressService,Address } from '../../providers/address-service';

import 'rxjs/add/operator/debounceTime';
import { FormBuilder, FormGroup } from '@angular/forms';

/**
 * Generated class for the ProfileSettingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-profile-settings',
  templateUrl: 'profile-settings.html',
})
export class ProfileSettingsPage {

  @ViewChild('fileInput') fileInput;
  @ViewChild('categoriesInput') categoriesInput;
  @ViewChild('hashgahaInput') hashgahaInput;
  @ViewChild('selectPictureType') selectPictureType;

  public loading:Loading;

  allInputsShows:any={};

  hashgahot:string[]=["Kosher","Lemehadrin","No"];
  categories:string[]=["Italian", "Sandwichs","Israeli", "Boulangerie"];
  
  public updateForm:FormGroup;

  constructor(public navCtrl: NavController, public authData: AuthService, 
  private userService:UserService,  public navParams: NavParams,
  public alertAndLoadingService: AlertAndLoadingService,
  public addressService: AddressService,
  public formBuilder: FormBuilder) {
    
    this.updateForm = formBuilder.group({
      address: [''],
      name: [''],
     
    });

      
    
  }


 


  jsonCatego(arr:string[]):any
  {
    console.log(arr);
  
    let myCategos:any=<any>{};
      arr.forEach(element => {
        myCategos[element]=true;
      });

    return myCategos;
  }

  ionViewDidLoad() {
    this.updateForm.controls.address.valueChanges.debounceTime(400).subscribe(search => {
      this.setFilteredItems();
  });
  }

  editInput(input:string,bool:boolean)
  {
    this.allInputsShows[input]=bool;
    switch (input) {
      case "categories":
      this.categoriesInput._elementRef.nativeElement.click();
        break;
       case "hashgaha":
      this.hashgahaInput._elementRef.nativeElement.click();
      break;
      case "address":
      if (bool)
        this.addressSelected=false;
        break;
      default:
        break;
    }

    

  }
  
  


  

  

  @ViewChild('address') addressInput ;
  searchAddress: string = '';
  addresses: any;
  shouldShowAddresses:boolean;
  searching:boolean=false;
  addressSelected:boolean=false;
  addressJSON:Address;


    
  showAddresses(toShow:boolean)
  {
   this.shouldShowAddresses=toShow;  
   if (!toShow)
   {
   this.searching=false;
   if (!this.addressSelected)
    this.searchAddress=null;
   }
  }

  lastStringTyped:string="";

  setFilteredItems() {
    console.log("FILTERING ADDRESSES");
    console.log(this.lastStringTyped);
    console.log(this.searchAddress);
    if ((this.searchAddress==null)||(this.searchAddress.length<2)
    ||(this.lastStringTyped==this.searchAddress)||(!this.shouldShowAddresses))
    {
      if ((this.searchAddress==null)||(this.searchAddress.length<2))
        this.addressSelected=false;
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
        this.addressJSON=addressJSON.value;
    });
    
   this.addressInput.setFocus();
    
  }
  
 


 logoutApp()
  {
     this.authData.logoutUser().then( authData => {
     
     this.navCtrl.setRoot(LoginPage);
     });
     
     this.alertAndLoadingService.showLoading();
  }




  

  
  


  
  
}
