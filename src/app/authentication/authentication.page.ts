import { Component } from '@angular/core';
import {AuthServiceProvider} from '../providers/auth-service.provider';
import {SpeechServiceProvider} from '../providers/speech-service.provider';
import {Router} from '@angular/router';

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
      private speechService: SpeechServiceProvider,
      private router: Router
  ) {
      this.user = {
          email: '',
          password: ''
      };
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
          });
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
