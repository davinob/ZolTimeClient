import { Injectable } from '@angular/core';
import { Firebase } from '@ionic-native/firebase';
import { Platform } from 'ionic-angular';


import { UserService } from './user-service';

@Injectable()
export class FcmService {

  

  constructor(
    public fcm: Firebase,
    private platform: Platform,
    private userService:UserService
    
  ) {}



  async getToken() {

    console.log("GETTING TOKEN");

 


    let token;

    if (this.platform.is('android')) {
      token = await this.fcm.getToken()
    } 
  
    if (this.platform.is('ios')) {
      token = await this.fcm.getToken();
      await this.fcm.grantPermission();
    } 

    
    
    return this.saveTokenToFirestore(token)
    
  }

  private saveTokenToFirestore(token) {
    
    if (!token) return;
     
    this.userService.userFCMToken=token;
    
  }
  




  listenToNotifications(){
  return this.fcm.onNotificationOpen();
  }



}