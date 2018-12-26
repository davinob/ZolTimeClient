import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SellerPage } from './seller';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    SellerPage,
  ],
  imports: [
    IonicPageModule.forChild(SellerPage),
    TranslateModule.forChild()
  ],
})
export class SellerPageModule {}
