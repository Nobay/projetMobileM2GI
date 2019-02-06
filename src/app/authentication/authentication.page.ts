import { Component } from '@angular/core';
import {AuthServiceProvider} from '../providers/auth-service.provider';
import { HostListener } from '@angular/core';
import { Platform , AlertController } from '@ionic/angular';
import { Dialogs } from '@ionic-native/dialogs/ngx';

@Component({
  selector: 'app-authentication',
  templateUrl: 'authentication.page.html',
  styleUrls: ['authentication.page.scss']
})
export class AuthenticationPage {

    user: any;
    error: string;

  constructor(
      private authService: AuthServiceProvider,
      private platform: Platform,
      private dialogs: Dialogs,
      private alertCtrl: AlertController 
  ) {
      this.user = {
          email: '',
          password: ''
      };
  }

  @HostListener('document:ionBackButton', ['$event'])
    private overrideHardwareBackAction($event: any) {
        $event.detail.register(100, async () => {
            this.dialogs.confirm('Are you sure you want to exit?','',['OK', 'Cancel'])
            .then(e =>{
                if (e==1) {
                    navigator['app'].exitApp();
                } else { }
            }
            )
            .catch(e => console.log('Error displaying dialog', e));
        });  

        

    }

  
    async doGoogleLogin() {
        this.authService.googleLogin(this.error);
    }

    async doNormalLogin() {
        this.authService.normalLogin(this.user, this.error, undefined);
    }
    
}
