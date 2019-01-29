import { Component } from '@angular/core';
import {LoadingController} from '@ionic/angular';
import {GooglePlus} from '@ionic-native/google-plus/ngx';
import {NativeStorage} from '@ionic-native/native-storage/ngx';
import {Router} from '@angular/router';

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

        this.googlePlus.login({'webClientId': '39902291526-ue6a0t28dniimm132gj8vt26v9ej1236.apps.googleusercontent.com'})
            .then(user => {
                loading.dismiss();

                this.nativeStorage.setItem('google_user', {
                    name: user.displayName,
                    email: user.email,
                    picture: user.imageUrl
                })
                    .then(() => {
                        console.log('teeeeest');
                        this.router.navigate(['/profile']);
                    }, error => {
                        console.log(error);
                    })
                loading.dismiss();
            }, err => {
                console.log(err)
                loading.dismiss();
            });
    }
    async presentLoading(loading) {
        return await loading.present();
    }
}
