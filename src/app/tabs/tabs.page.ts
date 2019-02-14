import { Component, OnInit } from '@angular/core';
import {TodoServiceProvider} from '../providers/todo-service.provider';
import {SpeechServiceProvider} from '../providers/speech-service.provider';
import {AuthServiceProvider} from '../providers/auth-service.provider';
import {Router} from '@angular/router';
import * as firebase from 'firebase';
import {AlertController} from '@ionic/angular';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage implements OnInit {
    todoMatches: string[] = [
        'to do', 'to dos', 'to do lists',
        'check to dos', 'check to do',
        'to do list', 'check lists', 'check list',
        'my list', 'lists', 'my lists', 'my to do',
        'my to do list', 'my to dos'
    ];
    groupMatches: string[] = [
        'group', 'groups', 'my groups', 'my group',
        'check groups', 'check group', 'check my groups',
        'check my group'
    ];
    profileMatches: string[] = [
        'profile', 'my profile', 'check profile', 'todos',
        'check my profile', 'my information'
    ];
    createMatches: string[] = [
        'create to do', 'create to do list',
        'create list', 'new to do', 'new to dos',
        'new to do list', 'new list'
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
      private alertCtrl: AlertController
  ) {}

  ngOnInit() {}

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
                                      this.todoService.addList(firebase.auth().currentUser.email, {
                                          uuid : this.todoService.makeId(),
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

}
