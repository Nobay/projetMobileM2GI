import {Component, OnDestroy, OnInit} from '@angular/core';
import {NativeStorage} from '@ionic-native/native-storage/ngx';
import {LoadingController} from '@ionic/angular';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {GooglePlus} from '@ionic-native/google-plus/ngx';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit, OnDestroy {

    user: any;
    userReady = false;
    subscription: Subscription;

    constructor(
        private googlePlus: GooglePlus,
        private nativeStorage: NativeStorage,
        public loadingController: LoadingController,
        private router: Router
    ) {
        this.subscription = this.router.events.subscribe((e: any) => {
            if (e instanceof NavigationEnd) {
                this.fetchUser();
            }
        });
    }

    async ngOnInit() {
    }
    async fetchUser() {
        const loading = await this.loadingController.create({
            message: 'Please wait...'
        });
        await loading.present();
        console.log(this.nativeStorage.getItem('google_user'));
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
                this.googlePlus.trySilentLogin({
                    'webClientId': '460159730586-6l007jt8hjij9k0t6jd8aunjnhj45h5g.apps.googleusercontent.com'
                }).then(res => {
                    console.error('Google trySilentLogin success');
                    this.googlePlus.disconnect().then( obj => {
                        console.error('Google logout success');
                        console.log(this.nativeStorage.getItem('google_user'));
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

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

}
