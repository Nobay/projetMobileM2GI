import * as firebase from 'firebase';
import {Injectable} from '@angular/core';
import {LoadingController, ToastController} from '@ionic/angular';
import {GooglePlus} from '@ionic-native/google-plus/ngx';
import {Router} from '@angular/router';
import {TodoServiceProvider} from './todo-service.provider';

@Injectable()
export class AuthServiceProvider {
    constructor(
        private loadingController: LoadingController,
        private googlePlus: GooglePlus,
        private router: Router,
        private toastCtrl: ToastController,
        private todoService: TodoServiceProvider
    ) {}

    async googleLogin(error) {
        const loading = await this.loadingController.create({
            message: 'Please wait...'
        });
        this.presentLoading(loading);
        console.log('before google plus login');
        this.googlePlus.login({
            'webClientId': '460159730586-6l007jt8hjij9k0t6jd8aunjnhj45h5g.apps.googleusercontent.com'
        })
            .then(user => {
                loading.dismiss();
                console.log('google plus login');
                const googleCredential = firebase.auth.GoogleAuthProvider.credential(user.idToken);
                firebase.auth().signInAndRetrieveDataWithCredential(googleCredential)
                    .then(connectedUser => {
                        this.todoService.addUser({
                            email: connectedUser.user.email,
                            username: connectedUser.user.displayName
                        });
                        this.router.navigate( ['/tabs']);
                    }, err => {
                        error = 'User credentials are incorrect.';
                    });
                loading.dismiss();
            }, err => {
                console.log(err);
                loading.dismiss();
            });
    }

    async normalLogin(user, error?, name?) {
        const loading = await this.loadingController.create({
            message: 'Please wait...'
        });
        this.presentLoading(loading);
        console.log('before login');
        loading.dismiss();
        console.log('login');
        const credential = {
            email: user.email,
            password: user.password
        };
        firebase.auth().signInWithEmailAndPassword(credential.email, credential.password)
            .then(connectedUser => {
                if (name) {
                    connectedUser.user.updateProfile( {
                        displayName: name,
                        photoURL: ''
                    }).then( succ => {
                        this.router.navigate( ['/tabs']);
                    });
                } else {
                    this.router.navigate( ['/tabs']);
                }
            }, err => {
                error = 'User credentials are incorrect.';
            });
        loading.dismiss();
    }

    logout() {
        const user = firebase.auth().currentUser;
        if (user.providerData[0]['providerId'] === 'google.com') {
            console.log('user is logged in with google');
            this.googleLogout();
        } else {
            console.log('user is logged in with username and password');
            firebase.auth().signOut().then(result => {
                this.router.navigate(['/']);
            }, error => {
                console.error('firebase logout error');
            });
        }
    }

    async updateUser(user, name) {
        const loading = await this.loadingController.create({
            message: 'Please wait...'
        });
        this.presentLoading(loading);
        console.log('before login');
        loading.dismiss();
        console.log('login');
        const credential = {
            email: user.email,
            password: user.password
        };
        firebase.auth().signInWithEmailAndPassword(credential.email, credential.password)
            .then(connectedUser => {
                console.log('name : ' + name);
                if (name) {
                    connectedUser.user.updateProfile( {
                        displayName: name,
                        photoURL: ''
                    }).then( succ => {
                        this.logout();
                        loading.dismiss();
                    });
                } else {
                    this.router.navigate( ['/tabs']);
                }
            });
    }

    googleLogout() {
        this.googlePlus.logout()
            .then(res => {
                console.error('Google logout success');
                firebase.auth().signOut().then(result => {
                    this.router.navigate(['/']);
                }, error => {
                    console.error('firebase logout error');
                });
            }, err => {
                console.error('Error logging out from Google: ' + err);
                this.googlePlus.trySilentLogin(
                    {'webClientID': '460159730586-6l007jt8hjij9k0t6jd8aunjnhj45h5g.apps.googleusercontent.com'}
                ).then(res => {
                    console.error('Google trySilentLogin success');
                    this.googlePlus.disconnect().then( obj => {
                            console.error('Google logout success');
                            firebase.auth().signOut().then(result => {
                                this.router.navigate(['/']);
                            }, error => {
                                console.error('firebase logout error');
                            });
                        }, err2 => {
                            console.error('Error logging out from Google for the 2nd time: ' + err);
                        }
                    );
                }, err1 => {
                    console.error('Google trySilentLogin error: ' + err);
                });
            });
    }

    async showToast(data: any) {
        const toast = await this.toastCtrl.create({
            message: data,
            duration: 2000,
            position: 'top'
        });
        toast.present();
    }

    async presentLoading(loading) {
        return await loading.present();
    }
}
