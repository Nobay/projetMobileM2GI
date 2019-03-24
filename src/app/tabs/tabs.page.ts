import { Component, OnInit } from '@angular/core';
import {TodoServiceProvider} from '../providers/todo-service.provider';
import {SpeechServiceProvider} from '../providers/speech-service.provider';
import {AuthServiceProvider} from '../providers/auth-service.provider';
import {Router} from '@angular/router';
import * as firebase from 'firebase';
import {AlertController, Platform, ToastController} from '@ionic/angular';
import {FcmService} from '../providers/fcm.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage implements OnInit {
    /* the possible matches for each speech recognition feature */
    todoMatches: string[] = [
        'to do', 'to dos', 'to do lists',
        'check to dos', 'check to do',
        'to do list', 'check lists', 'check list',
        'my list', 'lists', 'my lists', 'my to do',
        'my to do list', 'my to dos'
    ];
    groupMatches: string[] = [
        'group', 'groups', 'my groups', 'my groups',
        'check groups', 'check groups', 'check my groups',
        'check my groups'
    ];
    profileMatches: string[] = [
        'profile', 'my profile', 'check profile', 'todos',
        'check my profile', 'my information'
    ];
    createMatches: string[] = [
        'create to do', 'create to do list',
        'create list', 'new to do', 'new to dos',
        'new to do list', 'new list', 'create a list'
    ];
    logoutMatches: string[] = [
        'logout', 'log out', 'disconnect',
        'sign out', 'sign-out'
    ];
  constructor(
      private todoService: TodoServiceProvider,
      private speechService: SpeechServiceProvider,
      private authService: AuthServiceProvider,
      private router: Router,
      private alertCtrl: AlertController,
      private fcm: FcmService,
      private platform: Platform,
      private toastController: ToastController
  ) {
    this.router.navigate(['/tabs/profil']);
  }

  ngOnInit() {
      this.notificationSetup();
  }

  activateSpeech() {
      this.speechService.getPermission();
      this.speechService.startListening().subscribe( matches => {
          console.log(matches);
          this.todoBySpeech(matches);
          this.groupBySpeech(matches);
          this.profileBySpeech(matches);
          this.logoutBySpeech(matches);
          this.createListBySpeech(matches);
      });
  }

    /**
     * using google's speech recognition, we loop through his possible matches
     * and check whether they are correct to view the to-do lists page
     * @param matches
     */
  todoBySpeech(matches: string[]) {
      for ( let i = 0; i < matches.length; i++) {
          for ( let j = 0; j < this.todoMatches.length; j++) {
              if (matches[i].toLowerCase() === this.todoMatches[j]) {
                  this.router.navigate(['/tabs/todo']);
                  return;
              }
          }
      }
  }

    /**
     * using google's speech recognition, we loop through his possible matches
     * and check whether they are correct to view the groups page
     * @param matches
     */
  groupBySpeech(matches: string[]) {
      for ( let i = 0; i < matches.length; i++) {
          for ( let j = 0; j < this.groupMatches.length; j++) {
              if (matches[i].toLowerCase() === this.groupMatches[j]) {
                  this.router.navigate(['/tabs/groups']);
                  return;
              }
          }
      }
  }

    /**
     * using google's speech recognition, we loop through his possible matches
     * and check whether they are correct to view the profile page
     * @param matches
     */
  profileBySpeech(matches: string[]) {
      for ( let i = 0; i < matches.length; i++) {
          for ( let j = 0; j < this.profileMatches.length; j++) {
              if (matches[i].toLowerCase() === this.profileMatches[j]) {
                  this.router.navigate(['/tabs/profil']);
                  return;
              }
          }
      }
  }

    /**
     * using google's speech recognition, we loop through his possible matches
     * and check whether they are correct to create a to-do list
     * @param matches
     */
  async createListBySpeech(matches: string[]) {
      for ( let i = 0; i < matches.length; i++) {
          for ( let j = 0; j < this.createMatches.length; j++) {
              if (matches[i].toLowerCase() === this.createMatches[j]) {
                  this.router.navigate(['/tabs/todo']);
                  const alert = await this.alertCtrl.create({
                      header: 'Creating a to-do list',
                      inputs: [
                          {
                              name: 'name',
                              type: 'text',
                              placeholder: 'To-do list name'
                          }
                      ],
                      buttons: [
                          {
                              text: 'Cancel',
                              role: 'cancel',
                              cssClass: 'secondary',
                              handler: () => {
                                  console.log('cancel');
                              }
                          }, {
                              text: 'Create',
                              handler: data => {
                                  if (data.name !== '') {
                                      this.todoService.addList(firebase.auth().currentUser.uid, {
                                          uuid : this.todoService.makeId(),
                                          membershipIds : [],
                                          name : data.name,
                                          items : []
                                      });
                                  } else {
                                      this.authService.showToast('The name shouldn\'t be empty');
                                  }
                              }
                          }
                      ]
                  });
                  await alert.present();
                  return;
              }
          }
      }
  }

    /**
     * using google's speech recognition, we loop through his possible matches
     * and check whether they are correct to logout
     * @param matches
     */

  logoutBySpeech(matches: string[]) {
      for ( let i = 0; i < matches.length; i++) {
          for ( let j = 0; j < this.logoutMatches.length; j++) {
              if (matches[i].toLowerCase() === this.logoutMatches[j]) {
                  this.authService.logout();
                  return;
              }
          }
      }
  }

    private async presentToast(message) {
        const toast = await this.toastController.create({
            message: 'test',
            duration: 3000
        });
        toast.present();
    }

    /**
     * setting up the notification in the starting page
     */
    private notificationSetup() {
      this.fcm.getToken();
      this.fcm.onNotifications().subscribe(
        (msg) => {
            if (this.platform.is('ios')) {
                this.presentToast(msg.aps.alert);
            } else {
                console.log(msg.body);
                this.presentToast(msg.body);
            }
        });
  }

}
