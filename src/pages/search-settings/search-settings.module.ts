import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SearchSettingsPage } from './search-settings';

@NgModule({
  declarations: [
    SearchSettingsPage,
  ],
  imports: [
    IonicPageModule.forChild(SearchSettingsPage),
  ],
})
export class SearchSettingsPageModule {}
