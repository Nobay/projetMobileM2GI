import { Component } from '@angular/core';
import {AuthServiceProvider} from '../providers/auth-service.provider';

@Component({
  selector: 'app-authentication',
  templateUrl: 'authentication.page.html',
  styleUrls: ['authentication.page.scss']
})
export class AuthenticationPage {

    user: any;
    error: string;

  constructor(
      private authService: AuthServiceProvider
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
}
