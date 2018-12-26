import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SearchAddressPage } from './search-address';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations: [
    SearchAddressPage,
  ],
  imports: [
    IonicPageModule.forChild(SearchAddressPage),
    TranslateModule.forChild()
  ],
})
export class SearchAddressPageModule {}
