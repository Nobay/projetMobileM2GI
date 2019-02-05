import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import {NativeStorage} from '@ionic-native/native-storage/ngx';
import {Router} from '@angular/router';
import * as firebase from 'firebase';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private nativeStorage: NativeStorage,
    private router: Router
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                console.log('user is already connected');
                this.router.navigate(['/profile']);
                this.splashScreen.hide();
            } else {
                this.router.navigate(['/']);
                this.splashScreen.hide();
            }
        });
        this.statusBar.styleDefault();
    });
  }
}
