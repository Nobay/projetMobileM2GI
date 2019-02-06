import {Component, OnDestroy, OnInit} from '@angular/core';
import {NativeStorage} from '@ionic-native/native-storage/ngx';
import {LoadingController, ToastController} from '@ionic/angular';
import {NavigationEnd, Router} from '@angular/router';
import {GooglePlus} from '@ionic-native/google-plus/ngx';
import {Subscription} from 'rxjs';
import {AuthServiceProvider} from '../providers/auth-service.provider';
import * as firebase from 'firebase';

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
        private loadingController: LoadingController,
        private router: Router,
        private authService: AuthServiceProvider,
        private toastCtrl: ToastController
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
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                this.user = {
                    name:  user.displayName,
                    email:  user.email,
                    picture:  user.photoURL,
                };
                this.userReady = true;
                loading.dismiss();
            } else {
                console.log('User not connected, error');
                loading.dismiss();
            }
        });
    }
    viewTodos() {
        firebase.auth().onAuthStateChanged((user) => {
            if (!user.emailVerified) {
                this.authService.showToast('Verify your account in order to continue !');
            } else {
                this.router.navigate(['/todo']);
            }
        });
    }
    doLogout() {
        this.authService.logout();
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

}
