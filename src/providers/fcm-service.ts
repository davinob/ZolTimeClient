import { Injectable } from '@angular/core';
import { Firebase } from '@ionic-native/firebase';
import { Platform } from 'ionic-angular';
import { AngularFirestore } from 'angularfire2/firestore';


import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { UserService } from './user-service';

@Injectable()
export class FcmService {

  constructor(
    public fcm: Firebase,
    public afs: AngularFirestore,
    private platform: Platform,
    private userService:UserService
    
  ) {}
  
  async getToken() {
    console.log("GETTING TOKEN");

    this.fcm.onTokenRefresh().subscribe(token => {
      this.saveTokenToFirestore(token);
    });


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
  
    const devicesRef = this.afs.collection('pushDevices')
  
    const docData = { 
      token
    }
    this.userService.userFCMToken=token;
    console.log("TOKEN saved locally");
    console.log(this.userService.userFCMToken);
    return devicesRef.doc(token).set(docData)
  }
  

  listenToNotifications(){
      return this.fcm.onNotificationOpen();
  }



}