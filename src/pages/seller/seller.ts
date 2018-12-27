import { Component,ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams,Content, AlertController} from 'ionic-angular';
import { Seller, UserService, Product } from '../../providers/user-service';
import { GlobalService } from '../../providers/global-service';
import { Storage } from '@ionic/storage';
import { CallNumber } from '@ionic-native/call-number';
import { AlertAndLoadingService } from '../../providers/alert-loading-service';
import * as globalConstants from '../../providers/globalConstants'; 
import { PhotoViewer } from '@ionic-native/photo-viewer';
import { TranslateService } from '@ngx-translate/core';

import { first } from 'rxjs/operators';

@IonicPage()
@Component({
  selector: 'page-seller',
  templateUrl: 'seller.html',
})
export class SellerPage {


  @ViewChild(Content) content: Content;

  seller:Seller=null;
  subCategorySelected:string=null;

  constructor(public navCtrl: NavController, public navParams: NavParams, 
    public userService:UserService,
    public globalService:GlobalService,
    public storage:Storage,
    private callNumber: CallNumber,
    public alertService: AlertAndLoadingService, 
    public photoViewer:PhotoViewer,
    public alertCtrl: AlertController,
    public translateService:TranslateService
    ) {
    
      this.seller=this.navParams.data.seller;
    if (!this.seller)
    {
      let sellerKey=this.navParams.data.sellerKey;
      this.seller=this.userService.getSellerOfKey(sellerKey);
    }

    
   }


   async addToFavorites(seller)
   {

    this.userService.addToFavorites(seller); 
    let message=await this.translateService.get("הוסף למועדפים").pipe(first()).toPromise();
    this.alertService.presentToast({'message':message})

   }

   async removeFromFavorites(seller)
   {
    this.userService.removeFromFavorites(seller);
    let message=await this.translateService.get("הוסר מהמועדפים").pipe(first()).toPromise();
    this.alertService.presentToast({'message':message})

   }

   daysNames=["א'","ב'","ג'","ד'","ה'","ו'","ש'"];

   async showDaysHours()
   {
     console.log("show DAYS HOURS");
     let message="";
     
     console.log(this.seller.days);
     for (let i=0; i<this.seller.days.length;i++)
     {
       let dayName=await this.translateService.get(this.daysNames[i]).pipe(first()).toPromise();
      message+="<div class='newLine'><span class='alertHourTitle'>"+dayName+":</span><span class='alertHourDetails'>  "+this.seller.days[i].startTime+" - "+this.seller.days[i].endTime+"</span></div>";
     }

     console.log(message);
     let openHoursText=await this.translateService.get("שעות פתיחה").pipe(first()).toPromise();
    
     this.alertCtrl.create(
      {
        title: openHoursText,
        message:message
      }
    ).present();


   }

   showPicture(product)
   {
    var options = {
      share: false, // default is false
      closeButton: true, // default is true
      copyToReference: false // default is false
    };

     this.photoViewer.show( product.picture.url, '', options);
   }

   callTel(num:string)
{
  this.callNumber.callNumber(num, true);
}


  ionViewDidLoad() {
    console.log('ionViewDidLoad SellerPage'); 
       
  }

   ionViewDidEnter()
  {
    this.pageIsShown=true;
    this.initStuff();
  }

  async initStuff()
{
    console.log("MY SELLER is:");
    console.log(this.seller);
    await this.userService.fetchSellerProdsAndPromsReturnNeedsToWait(this.seller);
    this.initSubCategories();
    this.subscribeToRefreshProductsAndCategos();


    console.log('ionViewDidEnter SellerPageEEE'); 
    console.log(this.subCategoriesToShow);
    if (this.content)
    {
      this.content.resize();
    }
  }


  getURL(url:string)
  {
    return 'url(' + url + ')';
  }

  showPromoQty(product:Product)
  {
    return product.bestPromo && product.quantity>0;
  }

  subCategories:any[]=new Array();
  subCategoriesToShow:any[]=null;


  

  initSubCategories(){
    let category=null;

    console.log("SUB CATEGO FILTERING");
    for (const key in globalConstants.categories) {
      category=globalConstants.categories[key];
      if (category.name==this.seller.category)
        {
          console.log(category.subCategories);
          this.subCategories=category.subCategories;
          break;
        }
    }
   
    this.setCategoProductsToShow();

  }



  isSubCategorySelected(subCatego:any):boolean
  {
    return this.subCategorySelected && subCatego==this.subCategorySelected;
  }


  selectSubCategory(subCatego:any){
    console.log("Sub CATEGO SELECTED:"+subCatego);
    if (subCatego==this.subCategorySelected)
    {
      this.subCategorySelected=null;
    }
    else
    {
    this.subCategorySelected=subCatego;
    }

    

  }



  getCategoryProducts(catego:string):Array<any>
  {
    if (this.seller.productsPerCategory)
      return this.seller.productsPerCategory[catego];
  }

  getSellerProducts():Array<Product>
  {
    if (!this.seller.products)
    this.seller.products=new Array();

    return this.seller.products;

  }

  lookingForProdsSubscribed=false;
  pageIsShown:boolean;

  ionViewDidLeave()
  {
    this.pageIsShown=false;
  }



setCategoProductsToShow()
{
  console.log("SUB CATEGO TO SHOW");
  this.subCategoriesToShow=this.subCategories.filter(subCatego=>
    {

     if (!this.getCategoryProducts(subCatego))
      return false;

      if (this.getCategoryProducts(subCatego).length==0)
      return false;

      //at least one to show:
      let toShow= this.getCategoryProducts(subCatego).filter(product=>{return product.toShow}).length>0;
      console.log("TO SHOW:"+toShow);
      return toShow;
    });

  }

  isCategoProdsToShow(catego)
  {
    return !this.subCategorySelected || this.subCategorySelected==catego;
  }

  subscribeToRefreshProductsAndCategos()
  {
    if (!this.lookingForProdsSubscribed)
    {
      this.userService.lookingForProducts.subscribe(isLookingforProds=>
        {
          this.lookingForProdsSubscribed=true;
          if (!this.pageIsShown)
          return;


          this.setCategoProductsToShow();
          

     });
   }
  }







}
