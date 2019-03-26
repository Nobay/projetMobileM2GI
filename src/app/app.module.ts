import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy, AlertController } from '@ionic/angular';
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
import {AuthServiceProvider} from './providers/auth-service.provider';
import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { File } from '@ionic-native/file/ngx';
import { FilePath } from '@ionic-native/File-Path/ngx';
import { Dialogs } from '@ionic-native/dialogs/ngx';
import {SpeechServiceProvider} from './providers/speech-service.provider';
import { SpeechRecognition } from '@ionic-native/speech-recognition/ngx';
import {AuthGuard} from './providers/auth-guard';
import {MembershipServiceProvider} from './providers/membership-service.provider';
import { AdMobPro } from '@ionic-native/admob-pro/ngx';
import {Geolocation} from '@ionic-native/geolocation/ngx';
import { FcmService } from './providers/fcm.service';
import { Firebase } from '@ionic-native/firebase/ngx';
import {MapItemPage} from './todo-item/create-item/map-item/map-item.page';
import {AgmCoreModule} from '@agm/core';
import { NativeGeocoder } from '@ionic-native/native-geocoder/ngx';


firebase.initializeApp(environment.firebase);

@NgModule({
  declarations: [
      AppComponent,
      CreateItemPage,
      MapItemPage
  ],
  entryComponents: [CreateItemPage, MapItemPage],
  imports: [
      BrowserModule, IonicModule.forRoot(), AppRoutingModule,
      FormsModule,
      AngularFireModule.initializeApp(environment.firebase),
      AngularFirestoreModule.enablePersistence(),
      AgmCoreModule.forRoot({
          apiKey: 'AIzaSyDdYquiVBMOS8006P2lOs_i1q0cHqpvqTE'
      })
  ],
  providers: [
      StatusBar,
      FileChooser,
      FilePath,
      Dialogs,
      AdMobPro,
      AlertController,
      File,
      SplashScreen,
      { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
      TodoServiceProvider,
      AuthServiceProvider,
      MembershipServiceProvider,
      AuthGuard,
      SpeechServiceProvider,
      { provide: FirestoreSettingsToken, useValue: {} },
      GooglePlus,
      Geolocation,
      NativeStorage,
      SpeechRecognition,
      FcmService,
      Firebase,
      NativeGeocoder
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
