import { Injectable } from '@angular/core';
import { Firebase } from '@ionic-native/firebase';
import { Platform } from 'ionic-angular';
import { AngularFirestore } from 'angularfire2/firestore';


import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class FcmService {

  constructor(
    public firebaseNative: Firebase,
    public afs: AngularFirestore,
    private platform: Platform,
    
  ) {}

    currentMessage = new BehaviorSubject(null);


  
  async getToken() {

    let token;
  
    if (this.platform.is('android')) {
      token = await this.firebaseNative.getToken()
    } 
  
    if (this.platform.is('ios')) {
      token = await this.firebaseNative.getToken();
      await this.firebaseNative.grantPermission();
    } 

   

    
    return this.saveTokenToFirestore(token)
  }

  private saveTokenToFirestore(token) {
    if (!token) return;
  
    const devicesRef = this.afs.collection('pushDevices')
  
    const docData = { 
      token
    }
  
    return devicesRef.doc(token).set(docData)
  }
  

  listenToNotifications() {
    
    if (this.platform.is('ios')||this.platform.is('android'))
    {
      console.log(this.platform);
      return this.firebaseNative.onNotificationOpen();
    }
  }

}