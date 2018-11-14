import { Component,ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams,Content} from 'ionic-angular';
import { Seller, UserService, Product } from '../../providers/user-service';
import { GlobalService } from '../../providers/global-service';
import { Storage } from '@ionic/storage';
import { CallNumber } from '@ionic-native/call-number';
import { AlertAndLoadingService } from '../../providers/alert-loading-service';
import * as globalConstants from '../../providers/globalConstants'; 


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
    public alertService: AlertAndLoadingService
    ) {
    
    this.seller=this.navParams.data.seller;
    if (!this.seller)
    {
      let sellerKey=this.navParams.data.sellerKey;
      this.seller=this.userService.getSellerOfKey(sellerKey);
    }

    

    console.log("MY SELLER is:");
    console.log(this.seller);
    this.userService.fetchSellerProdsAndPromsReturnNeedsToWait(this.seller);
    this.initSubCategories();
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
    console.log('ionViewDidEnter SellerPage'); 
    if (this.content)
    {
      this.content.resize();
    }
  }


  showPromoQty(product:Product)
  {
    return product.bestPromo && product.quantity>0;
  }

  subCategories:any[]=new Array();
  
  wasFiltered:boolean=false;
  
  getSubCategories():any[]{
  
    if (!this.wasFiltered)
    {
      if (this.seller.productsPerCategory)
      {
      this.subCategories=this.subCategories.filter(subCatego=>
        {
          return this.seller.productsPerCategory[subCatego];
  
        });
        this.wasFiltered=true;
      }
    }
    return this.subCategories;
  }

  getSubCategoriesForShow():any[]
  {
    let subCategos:Array<any>;
    if (!this.subCategorySelected)
    subCategos=this.subCategories;
    else
    subCategos= [this.subCategorySelected];

    return subCategos.filter(catego=>
    {
      return this.getCategoryProducts(catego) && this.getCategoryProducts(catego).length>0;
    });
  }

  initSubCategories(){
    let category=null;

    console.log("SUB CATEGO FILTERING");
    for (const key in globalConstants.categories) {
      category=globalConstants.categories[key];
      if (category.name==this.seller.category)
        {
          console.log(category.subCategories);
          this.subCategories=category.subCategories;
          return;
        }
    }
    return new Array();
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



}
