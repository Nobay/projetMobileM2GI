import { Component } from '@angular/core';
import {AuthServiceProvider} from '../providers/auth-service.provider';
import {SpeechServiceProvider} from '../providers/speech-service.provider';

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
      private speechService: SpeechServiceProvider
  ) {
      this.user = {
          email: '',
          password: ''
      };
  }

    async doGoogleLogin() {
        this.authService.googleLogin(this.error);
    }

    async doNormalLogin() {
        this.authService.normalLogin(this.user, this.error, undefined);
    }

    activateSpeech() {
      this.speechService.getPermission();
      this.speechService.startListening();
    }

    stopSpeech() {
        this.speechService.stopListening();
    }
}
