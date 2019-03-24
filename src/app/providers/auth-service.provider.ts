import * as firebase from 'firebase';
import {Injectable} from '@angular/core';
import {LoadingController, ToastController} from '@ionic/angular';
import {GooglePlus} from '@ionic-native/google-plus/ngx';
import {Router} from '@angular/router';
import {TodoServiceProvider} from './todo-service.provider';
import {environment} from '../../environments/environment';

@Injectable()
export class AuthServiceProvider {
    constructor(
        private loadingController: LoadingController,
        private googlePlus: GooglePlus,
        private router: Router,
        private toastCtrl: ToastController,
        private todoService: TodoServiceProvider
    ) {}

    /**
     * using firebase's authentication service and Google+ login, we connect the user using his Google account
     * persisting his data in the process using a CRUD service.
     * @param error
     */
    async googleLogin(error) {
        const loading = await this.loadingController.create({
            message: 'Please wait...'
        });
        this.presentLoading(loading);
        console.log('before google plus login');
        this.googlePlus.login({
            'webClientId': environment.googlePlus.webClientID
        })
            .then(user => {
                loading.dismiss();
                console.log('google plus login');
                const googleCredential = firebase.auth.GoogleAuthProvider.credential(user.idToken);
                firebase.auth().signInAndRetrieveDataWithCredential(googleCredential)
                    .then(connectedUser => {
                        this.todoService.addUser({
                            uuid: connectedUser.user.uid,
                            email: connectedUser.user.email,
                            username: connectedUser.user.displayName,
                            imageUrl: connectedUser.user.photoURL
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

    /**
     * using firebase's authentication service and native login, we connect the user using his native account and
     * redirecting to the profile page if successful.
     * @param error
     */
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

    /**
     * logs out the user from the firebase's authentication service.
     */
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

    /**
     * updates the users data after creating a native account.
     * @param user
     */
    async updateUser(user) {
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
                if (user.name) {
                    connectedUser.user.updateProfile( {
                        displayName: user.name,
                        photoURL: user.imageUrl
                    }).then( succ => {
                        this.logout();
                        loading.dismiss();
                    });
                } else {
                    this.router.navigate( ['/tabs']);
                }
            });
    }

    /**
     * logs out from both Google+ and firebase's authentication service.
     */
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
                    {'webClientId': environment.googlePlus.webClientID}
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
