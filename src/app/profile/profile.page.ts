import { Component, OnInit } from '@angular/core';
import {NativeStorage} from '@ionic-native/native-storage/ngx';
import {LoadingController} from '@ionic/angular';
import {Router} from '@angular/router';
import {GooglePlus} from '@ionic-native/google-plus/ngx';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

    user: any;
    userReady = false;

    constructor(
        private googlePlus: GooglePlus,
        private nativeStorage: NativeStorage,
        public loadingController: LoadingController,
        private router: Router
    ) { }

    async ngOnInit() {
        const loading = await this.loadingController.create({
            message: 'Please wait...'
        });
        await loading.present();
        this.nativeStorage.getItem('google_user')
            .then(data => {
                this.user = {
                    name: data.name,
                    email: data.email,
                    picture: data.picture,
                };
                this.userReady = true;
                loading.dismiss();
            }, error => {
                console.log(error);
                loading.dismiss();
            });
    }
    viewTodos() {
        this.router.navigate(['/todo']);
    }
    doGoogleLogout() {
        this.googlePlus.logout()
            .then(res => {
                console.error('Google logout success');
                this.nativeStorage.remove('google_user');
                this.router.navigate(['/']);
            }, err => {
                console.error('Error logging out from Google: ' + err);
                this.googlePlus.trySilentLogin({'webClientId': '39902291526-ue6a0t28dniimm132gj8vt26v9ej1236.apps.googleusercontent.com'}).then(res => {
                    console.error('Google trySilentLogin success');
                    this.googlePlus.logout().then( obj => {
                        console.error('Google logout success');
                        this.nativeStorage.remove('google_user');
                        this.router.navigate(['/']);
                        }, err2 => {
                        console.error('Error logging out from Google for the 2nd time: ' + err);
                        }
                    );
                }, err1 => {
                    console.error('Google trySilentLogin error: ' + err);
                });
            });
    }

}
