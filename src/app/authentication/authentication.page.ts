import { Component } from '@angular/core';
import {AuthServiceProvider} from '../providers/auth-service.provider';
import { HostListener } from '@angular/core';
import { Platform , AlertController } from '@ionic/angular';
import { Dialogs } from '@ionic-native/dialogs/ngx';
import {SpeechServiceProvider} from '../providers/speech-service.provider';
import {Router} from '@angular/router';
import { AdMobPro } from '@ionic-native/admob-pro/ngx';

@Component({
  selector: 'app-authentication',
  templateUrl: 'authentication.page.html',
  styleUrls: ['authentication.page.scss']
})
export class AuthenticationPage {

    user: any;
    error: string;
    loginMatches: string[] = [
        'login', 'sign-in', 'sign in', 'login with google',
        'login google', 'google login', 'google sign-in',
        'google sign in', 'sign-in with google', 'sign in with google',
        'sign in google', 'sign-in google', 'authentication',
        'authenticate', 'authenticate with google', 'google authentication',
        'google authenticate'
    ];
    createMatches: string[] = [
        'create', 'sign-up', 'sign up', 'create account',
        'account creation', 'create account page', 'account creation page',
        'sign-up page', 'sign up page', 'registration',
        'registration page', 'register', 'account registration',
        'account registration page', 'new account', 'new account page',
        'new account creation', 'create new account'
    ];

  constructor(
      private authService: AuthServiceProvider,
      private platform: Platform,
      private dialogs: Dialogs,
      private alertCtrl: AlertController,
      private speechService: SpeechServiceProvider,
      private router: Router,
      private admob: AdMobPro
  ) {
      this.user = {
          email: '',
          password: ''
      };
      platform.ready().then(() => {
        const admobid = {
            banner: 'ca-app-pub-4235590516679342/1292352790',
            interstitial: 'ca-app-pub-4235590516679342/4784875248'
        };

        this.admob.createBanner({
            adId: admobid.banner,
            /* isTesting: true, */
            autoShow: true,
            position: this.admob.AD_POSITION.BOTTOM_CENTER
        });

        this.admob.prepareInterstitial({
            adId: admobid.interstitial,
            /* isTesting: true, */
            autoShow: false
        });
    });
  }

    showInterstitialAd() {
        if (AdMobPro) {
            this.admob.showInterstitial();
        }
    }

   @HostListener('document:ionBackButton', ['$event'])
    private overrideHardwareBackAction($event: any) {
    $event.detail.register(100, async () => {
        console.log(this.router.url);
        if (this.router.url === '/') {
            this.dialogs.confirm('Are you sure you want to exit?', '', ['OK', 'Cancel'])
            .then(e => {
                if (e === 1) {
                    navigator['app'].exitApp();
                } else { }
            }
            )
            .catch(e => console.log('Error displaying dialog', e));
        }
    });

    }

    doGoogleLogin() {
        this.authService.googleLogin(this.error);
    }

    doNormalLogin() {
        this.authService.normalLogin(this.user, this.error, undefined);
    }

    activateSpeech() {
      this.speechService.getPermission();
      this.speechService.startListening().subscribe( matches => {
          console.log(matches);
          this.loginBySpeech(matches);
          this.createBySpeech(matches);
          }, (err) => console.log(err));
    }

    loginBySpeech(matches: string[]) {
        for ( let i = 0; i < matches.length; i++) {
            for ( let j = 0; j < this.loginMatches.length; j++) {
                if (matches[i].toLowerCase() === this.loginMatches[j]) {
                    this.doGoogleLogin();
                    return;
                }
            }
        }
    }

    createBySpeech(matches: string[]) {
        for ( let i = 0; i < matches.length; i++) {
            for ( let j = 0; j < this.createMatches.length; j++) {
                if (matches[i].toLowerCase() === this.createMatches[j]) {
                    this.router.navigate(['/signup']);
                    return;
                }
            }
        }
    }
}
