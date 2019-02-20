import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase';
import {Router} from '@angular/router';
import {LoadingController, ModalController, ToastController} from '@ionic/angular';
import {AuthServiceProvider} from '../providers/auth-service.provider';
import {FileChooser} from '@ionic-native/file-chooser/ngx';
import {File} from '@ionic-native/file/ngx';
import {FilePath} from '@ionic-native/File-Path/ngx';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {

  user: any;
  cpassword: string;
  error: string;
  isLoading = false;

  constructor(
      private router: Router,
      private toastCtrl: ToastController,
      private authService: AuthServiceProvider,
      private modalCtrl: ModalController,
      private fileChooser: FileChooser,
      private file: File,
      private filePath: FilePath,
      public loadingController: LoadingController
  ) {
    this.user = { name: '', email: '', password: '', imageUrl: ''};
    this.cpassword = '';
  }

  ngOnInit() {
  }

  createAccount() {
    if (this.cpassword !== this.user.password) {
        this.error = 'Passwords do not match';
    } else {
        firebase.auth().createUserWithEmailAndPassword(this.user.email, this.user.password)
            .then(user => {
                this.authService.showToast('Your account has been created');
                user.user.sendEmailVerification().then( () => {
                    this.authService.updateUser(this.user).then( succ => {
                    });
                });
            }, err => {
                this.error = 'Service unavailable or account already exists';
            });
    }
  }

    choose() {
        this.fileChooser.open().then((uri) => {
            this.filePath.resolveNativePath(uri).then(filePath => {
                const dirPathSegments = filePath.split('/');
                const fileName = dirPathSegments[dirPathSegments.length - 1];
                dirPathSegments.pop();
                const dirPath = dirPathSegments.join('/');
                this.file.readAsArrayBuffer(dirPath, fileName).then(async (buffer) => {
                    await this.upload(buffer, fileName);
                }).catch((err) => {
                    alert(err.toString());
                });
            });
        });
    }

    public async upload(buffer, name) {
        await this.present();
        const blob = new Blob([buffer], {type: 'image/jpeg, image/png'});
        const storage = firebase.storage();

        storage.ref('images/' + name).put(blob).then((d) => {
            storage.ref('images/' + name).getDownloadURL().then((url) => {
                this.user.imageUrl = url;
            });
            this.dismiss();
        }).catch((error) => {
            alert('not Done' + error);
        });
    }

    async present() {
        this.isLoading = true;
        return await this.loadingController.create({
            message: 'Uploading image',
            duration: 5000,
        }).then(a => {
            a.present().then(() => {
                if (!this.isLoading) {
                    a.dismiss().then(() => console.log('abort presenting'));
                }
            });
        });
    }

    async dismiss() {
        this.isLoading = false;
        return await this.loadingController.dismiss().then(() => console.log('dismissed'));
    }

}
