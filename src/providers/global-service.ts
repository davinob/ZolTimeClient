import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';

import { Observable } from 'rxjs/Observable';





@Injectable()
export class GlobalService {
  
    userID:string;

  constructor() { 
   }


 
   public categories=
   [
    {
      name: "Boulangerie",
      icon: "bread.svg",
      subCategories: ["Bread", "Cake", "Borekas", "Salad", "Sandwich","Drinks","Desserts"]
    },
    {
      name: "Sandwich",
      icon: "sandwich.svg",
      subCategories: ["Sandwich","Drinks","Desserts"]
    },
    {
       name: "American",
       icon: "hamburger.svg",
       subCategories: ["Hamburger", "Fries", "Hot-Dog", "Salad","Drinks","Desserts"]
     },
     {
       name: "Italian",
       icon: "italian.svg",
       subCategories: ["Pizza", "Lasagna", "Pasta", "Salad","Drinks","Desserts"]
     },
      {
       name: "Israeli",
       icon: "falafel.png",
       subCategories: ["Shawarma", "Falafel", "Fries", "Shnitzel", "Humus", "Salad","Drinks","Desserts"]
     }
     
    
    ];
  
  




  
 
}