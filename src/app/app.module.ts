import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {TodoServiceProvider} from './providers/todo-service.provider';
import {CreateItemPage} from './todo-item/create-item/create-item.page';
import {FormsModule} from '@angular/forms';

import { AngularFireModule } from 'angularfire2';
import { environment } from '../environments/environment';
import { AngularFirestoreModule, FirestoreSettingsToken } from 'angularfire2/firestore';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import * as firebase from 'firebase';

firebase.initializeApp(environment.firebase);

import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { File } from '@ionic-native/file/ngx';
import { FilePath } from '@ionic-native/File-Path/ngx';

@NgModule({
  declarations: [
      AppComponent,
      CreateItemPage
  ],
  entryComponents: [CreateItemPage],
  imports: [
      BrowserModule, IonicModule.forRoot(), AppRoutingModule,
      FormsModule,
      AngularFireModule.initializeApp(environment.firebase),
      AngularFirestoreModule,
  ],
  providers: [
      StatusBar,
      FileChooser,
      FilePath,
      File,
      SplashScreen, 
      { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
      TodoServiceProvider,
      { provide: FirestoreSettingsToken, useValue: {} },
      GooglePlus,
      NativeStorage
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
