import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SearchSettingsPage } from './search-settings';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    SearchSettingsPage,
  ],
  imports: [
    IonicPageModule.forChild(SearchSettingsPage),
    TranslateModule.forChild()
  ],
})
export class SearchSettingsPageModule {}
