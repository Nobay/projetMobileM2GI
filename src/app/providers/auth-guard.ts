import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router';
import { Router } from '@angular/router';
import * as firebase from 'firebase';
import {AuthServiceProvider} from './auth-service.provider';
import {TodoServiceProvider} from './todo-service.provider';
import {Observable} from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): boolean | Observable<boolean> | Promise<boolean> {
        return new Promise((resolve, reject) => {
            firebase.auth().onAuthStateChanged( user => {
                if (!user.emailVerified) {
                    this.authService.showToast('Verify your account in order to manipulate your lists/groups !');
                    resolve(false);
                } else {
                    this.todoService.addUser({
                        email: firebase.auth().currentUser.email,
                        username: firebase.auth().currentUser.displayName
                    });
                    resolve(true);
                }
            });
        });
    }
    constructor(
        private router: Router,
        private authService: AuthServiceProvider,
        private todoService: TodoServiceProvider
    ) { }
}
