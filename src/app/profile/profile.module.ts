import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ProfilePage } from './profile.page';
import {AgmCoreModule} from '@agm/core';

const routes: Routes = [
  {
    path: '',
    component: ProfilePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    AgmCoreModule.forRoot({
        apiKey: 'AIzaSyDdYquiVBMOS8006P2lOs_i1q0cHqpvqTE'
    })
  ],
  declarations: [ProfilePage]
})
export class ProfilePageModule {}
