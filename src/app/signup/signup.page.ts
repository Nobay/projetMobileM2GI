import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase';
import {Router} from '@angular/router';
import {ToastController} from '@ionic/angular';
import {AuthServiceProvider} from '../providers/auth-service.provider';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {

  user: any;
  cpassword: string;
  error: string;

  constructor(
      private router: Router,
      private toastCtrl: ToastController,
      private authService: AuthServiceProvider
  ) {
    this.user = { name: '', email: '', password: ''};
  }

  ngOnInit() {
  }

  createAccount() {
    if (this.cpassword !== this.user.password) {
        this.error = 'Passwords do not match';
    } else {
        firebase.auth().createUserWithEmailAndPassword(this.user.email, this.user.password)
            .then(user => {
                this.showToast('Your account has been created');
                user.user.sendEmailVerification().then( () => {
                    this.authService.updateUser(this.user, this.user.name).then( succ => {
                    });
                });
            }, err => {
                this.error = 'Service unavailable.';
            });
    }
  }
  async showToast(data: any) {
      const toast = await this.toastCtrl.create({
          message: data,
          duration: 2000,
          position: 'top'
      });
      toast.present();
  }

}
