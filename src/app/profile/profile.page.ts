import {Component, OnDestroy, OnInit} from '@angular/core';
import {NativeStorage} from '@ionic-native/native-storage/ngx';
import {LoadingController, ToastController} from '@ionic/angular';
import {NavigationEnd, Router} from '@angular/router';
import {GooglePlus} from '@ionic-native/google-plus/ngx';
import {Subscription} from 'rxjs';
import {AuthServiceProvider} from '../providers/auth-service.provider';
import * as firebase from 'firebase';
import {TodoServiceProvider} from '../providers/todo-service.provider';
import {SpeechServiceProvider} from '../providers/speech-service.provider';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit, OnDestroy {

    user: any;
    userReady = false;
    subscription: Subscription;
    checkMatches: string[] = [
        'todo', 'to-do', 'to do', 'todos',
        'to-dos', 'to dos', 'todo lists',
        'to-do lists', 'to do lists', 'to-do lists',
        'check', 'check todos', 'check to-dos',
        'check to dos', 'check to do', 'check todo',
        'check to-do', 'todo list', 'to-do list',
        'to do list', 'check lists', 'check list',
        'my list', 'lists', 'my lists', 'my to-do list',
        'my todo list', 'my to do list', 'my todos',
        'my to-dos', 'my to dos'
    ];
    logoutMatches: string[] = [
        'logout', 'log out', 'disconnect',
        'sign out', 'sign-out'
    ];

    constructor(
        private googlePlus: GooglePlus,
        private nativeStorage: NativeStorage,
        private loadingController: LoadingController,
        private router: Router,
        private authService: AuthServiceProvider,
        private todoService: TodoServiceProvider,
        private speechService: SpeechServiceProvider,
    ) {
        this.subscription = this.router.events.subscribe((e: any) => {
            if (e instanceof NavigationEnd) {
                this.fetchUser();
            }
        });
    }

    async ngOnInit() {
    }
    async fetchUser() {
        const loading = await this.loadingController.create({
            message: 'Please wait...'
        });
        await loading.present();
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                this.user = {
                    name:  user.displayName,
                    email:  user.email,
                    picture:  user.photoURL,
                };
                this.userReady = true;
                loading.dismiss();
            } else {
                console.log('User not connected, error');
                loading.dismiss();
            }
        });
    }
    viewTodos() {
        if (!firebase.auth().currentUser.emailVerified) {
            this.authService.showToast('Verify your account in order to continue !');
        } else {
            this.todoService.addUser({
                email: firebase.auth().currentUser.email,
                username: firebase.auth().currentUser.displayName
            });
            this.router.navigate(['/todo']);
        }
    }
    doLogout() {
        this.authService.logout();
    }

    activateSpeech() {
        this.speechService.getPermission();
        this.speechService.startListening().subscribe( matches => {
            console.log(matches);
            this.checkBySpeech(matches);
            this.logoutBySpeech(matches);
        });
    }

    checkBySpeech(matches: string[]) {
        for ( let i = 0; i < matches.length; i++) {
            for ( let j = 0; j < this.checkMatches.length; j++) {
                if (matches[i].toLowerCase() === this.checkMatches[j]) {
                    this.viewTodos();
                    return;
                }
            }
        }
    }

    logoutBySpeech(matches: string[]) {
        for ( let i = 0; i < matches.length; i++) {
            for ( let j = 0; j < this.logoutMatches.length; j++) {
                if (matches[i].toLowerCase() === this.logoutMatches[j]) {
                    this.doLogout();
                    return;
                }
            }
        }
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

}
