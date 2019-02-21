import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {MembershipServiceProvider} from '../providers/membership-service.provider';
import {TodoServiceProvider} from '../providers/todo-service.provider';
import {User} from '../models/user';
import * as firebase from 'firebase';
import {AlertController, IonList, LoadingController} from '@ionic/angular';
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
  members: User[];
  pendingMembers: User[];
  groupReady = [false, false, false];
  ownerReady = false;
  currentMembership: Membership;
  currentUserLists: TodoList[];
  loading;

  @ViewChild('slidingList') slidingList: IonList;

  constructor(
      private route: ActivatedRoute,
      private membershipService: MembershipServiceProvider,
      private todoService: TodoServiceProvider,
      private alertCtrl: AlertController,
      private loadingController: LoadingController
  ) {}

  async ngOnInit() {
      this.loading = await this.loadingController.create({
          message: 'Fetching users...'
      });
      this.presentLoading(this.loading);
      this.subscription = this.route.queryParams.subscribe(params => {
          this.members = [];
          this.pendingMembers = [];
          this.groupId = params['id'];
          this.todoService.getLists(firebase.auth().currentUser.uid).subscribe( lists => {
          if (lists.length === 0) {
              this.currentUserLists = undefined;
          } else {
              this.currentUserLists = lists;
          }
            this.groupReady[0] = true;
            this.membershipService.getMembership(this.getCurrentUser().uid, this.groupId).subscribe( membership => {
              this.currentMembership = membership;
              this.groupReady[1] = true;
              this.fetchUsers();
            });
          });
      });
  }

  fetchUsers() {
      this.membershipService.getAllUsersInGroup(this.groupId).subscribe( memberships => {
          for (const membership of memberships) {
            if (!membership.isOwner && membership.hasMembership) {
                this.todoService.getUser(membership.userId).subscribe(user => {
                    if (this.existsAsMember(user.uuid, this.members) === false) {
                        this.members.push(user);
                    }
                });
            } else if (!membership.hasMembership) {
                this.todoService.getUser(membership.userId).subscribe(user => {
                    if (this.existsAsMember(user.uuid, this.pendingMembers) === false) {
                        this.pendingMembers.push(user);
                    }
                });
            } else if (membership.isOwner) {
                this.todoService.getUser(membership.userId).subscribe(user => {
                    this.owner = user;
                    this.ownerReady = true;
                });
            }
          }
      this.groupReady[2] = true;
      this.loading.dismiss();
    }, () => this.loading.dismiss());
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
                      const index = this.pendingMembers.findIndex(member => member.uuid === user.uuid);
                      if (index !== -1) {
                          this.pendingMembers.splice(index, 1);
                      }
                  }
              }
          ]
      });
      await alert.present();
      await this.slidingList.closeSlidingItems();
  }

  async removeMember(user: User) {
      let message = '';
      let confirmation = '';
      if (user.uuid === this.getCurrentUser().uid) {
          message = 'quit the group ?';
          confirmation = 'Quit';
      } else if (this.getCurrentUser().uid === this.owner.uuid) {
          message = 'kick the user \'' + user.username + '\'?';
          confirmation = 'Kick him';
      }

      const alert = await this.alertCtrl.create({
          header: 'Confirm!',
          message: 'Are you sure want to ' + message,
          buttons: [
              {
                  text: 'Cancel',
                  role: 'cancel',
                  cssClass: 'secondary',
                  handler: () => {
                      console.log('cancel');
                  }
              }, {
                  text: confirmation,
                  handler: () => {
                      this.membershipService.deleteMembership(user.uuid, this.groupId);
                      const index = this.members.findIndex(member => member.uuid === user.uuid);
                      if (index !== -1) {
                          this.members.splice(index, 1);
                      }
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
                      const index = this.pendingMembers.findIndex(member => member.uuid === user.uuid);
                      if (index !== -1) {
                          this.pendingMembers.splice(index, 1);
                      }
                  }
              }
          ]
      });
      await alert.present();
      await this.slidingList.closeSlidingItems();
  }

  isMember(): boolean {
      if (this.groupIsReady() && this.ownerReady) {
          if (this.owner.uuid === this.getCurrentUser().uid) {
              return true;
          }
          for (const member of this.members) {
              if (member.uuid === this.getCurrentUser().uid) {
                  return true;
              }
          }
          for (const member of this.pendingMembers) {
              if (member.uuid === this.getCurrentUser().uid) {
                  return true;
              }
          }
      }
      return false;
  }
  isPending(): boolean {
      if (this.groupIsReady() && this.ownerReady) {
          if (this.owner.uuid === this.getCurrentUser().uid) {
              return false;
          }
          for (const member of this.members) {
              if (member.uuid === this.getCurrentUser().uid) {
                  return false;
              }
          }
          for (const member of this.pendingMembers) {
              if (member.uuid === this.getCurrentUser().uid) {
                  return true;
              }
          }
      }
      return false;
  }

  groupIsReady(): boolean {
      for (const isReady of this.groupReady) {
          if (isReady === false) {
              return false;
          }
      }
      return true;
  }

    async presentMyLists() {
        const lists = [];
        for (const list of this.currentUserLists) {
            list.membershipIds = list.membershipIds.filter( id => {
                const idSplit = id.split('_', 2);
                return idSplit[0] !== this.getCurrentUser().uid;
            });
            let occurrence = false;
            for (const id of list.membershipIds) {
                if (id === (this.currentMembership.userId + '_' + this.currentMembership.groupId)) {
                    occurrence = true;
                }
            }
            if (occurrence === true) {
                lists.push({
                    name: list.uuid.toLowerCase(),
                    type: 'checkbox',
                    label: list.name,
                    value: list.uuid,
                    checked: true
                });
                console.log('checked already');
            } else {
                lists.push({
                    name: list.uuid.toLowerCase(),
                    type: 'checkbox',
                    label: list.name,
                    value: list.uuid,
                    checked: false
                });
            }

        }
        const alert = await this.alertCtrl.create({
            header: 'Share your lists',
            inputs: lists,
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    cssClass: 'secondary',
                    handler: () => {
                        console.log('Confirm Cancel');
                    }
                }, {
                    text: 'Share',
                    handler: data => {
                        for (const value of data ) {
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
                                        list.membershipIds.push(this.currentMembership.userId + '_'
                                            + this.currentMembership.groupId);
                                        this.todoService.editList(this.getCurrentUser().uid, list);
                                    }
                                }
                            }
                        }
                    }
                }
            ]
        });

        await alert.present();
    }


    existsAsMember(userId, members) {
        for ( let i = 0; i < members.length; i++) {
            if (members[i].uuid === userId) {
                return true;
            }
        }
        return false;
    }

  async presentLoading(loading) {
    return await loading.present();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
