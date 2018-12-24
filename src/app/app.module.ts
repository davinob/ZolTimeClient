import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import {  HttpClientModule, HttpClient } from '@angular/common/http';
import { MyApp } from './app.component';




import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { Camera } from '@ionic-native/camera';


import { HttpModule, Http } from '@angular/http';

import { IonicStorageModule } from '@ionic/storage';

import { AlertAndLoadingService } from '../providers/alert-loading-service';
import { UserService } from './../providers/user-service';
import { AddressService } from './../providers/address-service';

import * as fbConfig from './../providers/fbConfig'; 

import { Geolocation } from '@ionic-native/geolocation';

import { FcmService } from '../providers/fcm-service';


import { CallNumber } from '@ionic-native/call-number';
import { Firebase } from '@ionic-native/firebase';

import { Diagnostic } from '@ionic-native/diagnostic';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { GlobalService } from './../providers/global-service';

import * as firebase from "firebase";

import { PhotoViewer } from '@ionic-native/photo-viewer';
import { ProductsPage } from '../pages/products/products';

  
import { TranslateModule,TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

firebase.initializeApp(fbConfig.firebaseConfig);


export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}


@NgModule({
  declarations: [
    MyApp,
    ProductsPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    IonicStorageModule.forRoot(),
    IonicModule.forRoot(MyApp),
   
    
    
    
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    ProductsPage
  ],
  providers: [
    
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    UserService,
    AddressService,
    AlertAndLoadingService,
    Camera,
    Geolocation,
    Firebase,
    FcmService,
    CallNumber,
    LocationAccuracy,
    Diagnostic,
    GlobalService,
    PhotoViewer 
   
    
    
    
  ]
})
export class AppModule {}


