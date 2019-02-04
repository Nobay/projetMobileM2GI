import { Component } from '@angular/core';
import {LoadingController} from '@ionic/angular';
import {GooglePlus} from '@ionic-native/google-plus/ngx';
import {NativeStorage} from '@ionic-native/native-storage/ngx';
import {Router} from '@angular/router';
import * as firebase from 'firebase';

@Component({
  selector: 'app-authentication',
  templateUrl: 'authentication.page.html',
  styleUrls: ['authentication.page.scss']
})
export class AuthenticationPage {
  constructor(
      private loadingController: LoadingController,
      private googlePlus: GooglePlus,
      private nativeStorage: NativeStorage,
      private router: Router
  ) {}

    async doGoogleLogin() {
        const loading = await this.loadingController.create({
            message: 'Please wait...'
        });
        this.presentLoading(loading);
        console.log('before google plus login');
        this.googlePlus.login({
            'webClientId': '376336795720-qs2cvpoqnc70ekoeah467s6kualet0f2.apps.googleusercontent.com'
        })
            .then(user => {
                loading.dismiss();
                console.log('google plus login');
                const googleCredential = firebase.auth.GoogleAuthProvider.credential(user.idToken);
                firebase.auth().signInWithCredential(googleCredential)
                    .then(connectedUser => {
                        this.nativeStorage.setItem('google_user', {
                            name: connectedUser.displayName,
                            email: connectedUser.email,
                            picture: connectedUser.photoURL
                        })
                            .then(() => {
                                console.log('login and authentication successful');
                                this.router.navigate( ['/profile']);
                            }, error => {
                                console.error(error);
                            });
                    }, err => {
                    console.error(err);
                });
                loading.dismiss();
            }, err => {
                console.log(err);
                loading.dismiss();
            });
    }
    async presentLoading(loading) {
        return await loading.present();
    }
}
