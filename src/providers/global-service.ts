import { Injectable } from '@angular/core';




@Injectable()
export class GlobalService {
  
    userID:string;

  constructor() { 
   }


 
   public categories=
   [
    {
      name: "Boulangerie",
      description:"Boulangerie",
      icon: "bread.svg",
      subCategories: ["Bread", "Cake", "Borekas", "Salad", "Sandwich","Drinks","Desserts"]
    },
    {
      name: "Sandwich",
      description:"Sandwich",
      icon: "sandwich.svg",
      subCategories: ["Sandwich","Drinks","Desserts"]
    },
    {
       name: "American",
       description:"American",
       icon: "hamburger.svg",
       subCategories: ["Hamburger", "Fries", "Hot-Dog", "Salad","Drinks","Desserts"]
     },
     {
       name: "Italian",
       description:"Italian",
       icon: "italian.svg",
       subCategories: ["Pizza", "Lasagna", "Pasta", "Salad","Drinks","Desserts"]
     },
      {
       name: "Israeli",
       description:"Israeli",
       icon: "falafel.png",
       subCategories: ["Shawarma", "Falafel", "Fries", "Shnitzel", "Humus", "Salad","Drinks","Desserts"]
     }
     
    
    ];
  
  




  
 
}