import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {MembershipServiceProvider} from '../providers/membership-service.provider';
import {TodoServiceProvider} from '../providers/todo-service.provider';
import {User} from '../models/user';
import * as firebase from 'firebase';
import {AlertController, IonList} from '@ionic/angular';
import {TodoList} from '../models/todoList';
import {Membership} from '../models/membership';

@Component({
  selector: 'app-group',
  templateUrl: './group.page.html',
  styleUrls: ['./group.page.scss'],
})
export class GroupPage implements OnInit, OnDestroy {

  subscription: Subscription;
  groupId: string;
  owner: User;
  members: User[] = [];
  pendingMembers: User[] = [];
  groupReady = [false, false, false];
  currentMembership: Membership;
  currentUserLists: TodoList[];

  @ViewChild('slidingList') slidingList: IonList;

  constructor(
      private route: ActivatedRoute,
      private membershipService: MembershipServiceProvider,
      private todoService: TodoServiceProvider,
      private alertCtrl: AlertController
  ) { }

  ngOnInit() {
      this.subscription = this.route.queryParams.subscribe(params => {
          this.groupId = params['id'];
          this.fetchUsers();
          this.todoService.getLists(firebase.auth().currentUser.uid).subscribe( lists => {
            this.currentUserLists = lists;
            this.groupReady[1] = true;
          });
          this.membershipService.getMembership(this.getCurrentUser().uid, this.groupId).subscribe( membership => {
            this.currentMembership = membership;
            this.groupReady[2] = true;
          });
      });
  }

  fetchUsers() {
      this.membershipService.getAllUsersInGroup(this.groupId).subscribe( memberships => {
      for (const membership of memberships) {
        if (!membership.isOwner && membership.hasMembership) {
            this.todoService.getUser(membership.userId).subscribe(user => {
                this.members.push(user);
            });
        } else if (!membership.hasMembership) {
            this.todoService.getUser(membership.userId).subscribe(user => {
                this.pendingMembers.push(user);
            });
        } else if (membership.isOwner) {
            this.todoService.getUser(membership.userId).subscribe(user => {
                this.owner = user;
            });
        }
      }
      this.groupReady[0] = true;
    });
  }
  getCurrentUser(): firebase.User {
    return firebase.auth().currentUser;
  }
  async acceptMember(user: User) {
      const alert = await this.alertCtrl.create({
          header: 'Confirm!',
          message: 'Continue and accept \'' + user.username + '\' as a member ?',
          buttons: [
              {
                  text: 'Cancel',
                  role: 'cancel',
                  cssClass: 'secondary',
                  handler: () => {
                      console.log('cancel');
                  }
              }, {
                  text: 'Confirm',
                  handler: () => {
                      this.membershipService.editMembership({
                          userId: user.uuid,
                          groupId: this.groupId,
                          hasMembership: true,
                          isOwner: false,
                          date: Date.now()
                      });
                  }
              }
          ]
      });
      await alert.present();
      await this.slidingList.closeSlidingItems();
  }

  async removeMember(user: User) {
      const alert = await this.alertCtrl.create({
          header: 'Confirm!',
          message: 'Are you sure want to kick the user \'' + user.username + '\'?',
          buttons: [
              {
                  text: 'Cancel',
                  role: 'cancel',
                  cssClass: 'secondary',
                  handler: () => {
                      console.log('cancel');
                  }
              }, {
                  text: 'Kick him',
                  handler: () => {
                      this.membershipService.deleteMembership(user.uuid, this.groupId);
                  }
              }
          ]
      });
      await alert.present();
      await this.slidingList.closeSlidingItems();
  }

  async refuseMember(user: User) {
      const alert = await this.alertCtrl.create({
          header: 'Confirm!',
          message: 'Refuse \'' + user.username + '\' request to join the group ?',
          buttons: [
              {
                  text: 'Cancel',
                  role: 'cancel',
                  cssClass: 'secondary',
                  handler: () => {
                      console.log('cancel');
                  }
              }, {
                  text: 'Refuse him',
                  handler: () => {
                      this.membershipService.deleteMembership(user.uuid, this.groupId);
                  }
              }
          ]
      });
      await alert.present();
      await this.slidingList.closeSlidingItems();
  }

  shareLists(event) {
    const values = event.detail.value;
    for (const value of values ) {
      for (const list of this.currentUserLists) {
          list.membershipIds = list.membershipIds.filter( id => {
              const idSplit = id.split('_', 2);
              return idSplit[0] !== this.getCurrentUser().uid;
          });
        if (value === list.uuid) {
            let occurrence = false;
            for (const id of list.membershipIds) {
                if (id === (this.currentMembership.userId + '_' + this.currentMembership.groupId)) {
                    occurrence = true;
                }
            }
            if (occurrence === false) {
                list.membershipIds.push(this.currentMembership.userId + '_' + this.currentMembership.groupId);
                this.todoService.editList(this.getCurrentUser().uid, list);
            }
        }
      }
    }
  }

  groupIsReady(): boolean {
      for (const isReady of this.groupReady) {
          if (isReady === false) {
              return false;
          }
      }
      return true;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
