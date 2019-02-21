import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {TodoList} from '../models/todoList';
import {TodoServiceProvider} from '../providers/todo-service.provider';
import {Router} from '@angular/router';
import {AlertController, IonList, LoadingController, ToastController} from '@ionic/angular';
import {Subscription} from 'rxjs';
import {AuthServiceProvider} from '../providers/auth-service.provider';
import * as firebase from 'firebase';
import {MembershipServiceProvider} from '../providers/membership-service.provider';
import {load} from '@angular/core/src/render3';

@Component({
  selector: 'app-todo',
  templateUrl: 'todo.page.html',
  styleUrls: ['todo.page.scss']
})
export class TodoPage implements OnInit, OnDestroy {
  todoLists: TodoList[];
  sharedLists;
  usersShared;
  groupsShared;
  todoListReady = false;
  sharedListReady = false;
  subscription: Subscription;
  @ViewChild('slidingList') slidingList: IonList;

  constructor(
      private todoListService: TodoServiceProvider,
      private authService: AuthServiceProvider,
      private router: Router,
      private alertCtrl: AlertController,
      private membershipService: MembershipServiceProvider,
      private loadingController: LoadingController
  ) {}

  async ngOnInit() {
      const loading = await this.loadingController.create({
          message: 'Fetching to-do lists...'
      });
      this.presentLoading(loading);
    this.subscription = this.todoListService.getLists(firebase.auth().currentUser.uid).subscribe( data => {
        this.todoLists = data;
        this.todoListReady = true;
        this.sharedLists = [];
        this.usersShared = [];
        this.groupsShared = [];
        this.membershipService.getAllMyGroups(firebase.auth().currentUser.uid).subscribe( memberships => {
            if (memberships.length === 0) {
                loading.dismiss();
            }
            for (const membership of memberships) {
                this.membershipService.getAllUsersInGroup(membership.groupId).subscribe(usersInGroup => {
                    if (usersInGroup.length === 0) {
                        loading.dismiss();
                    }
                    for (const userMembership of usersInGroup) {
                        this.todoListService.getLists(userMembership.userId).subscribe( lists => {
                            if (lists.length === 0) {
                                loading.dismiss();
                            }
                            for (const list of lists)  {
                                if (list.membershipIds.length === 0) {
                                    loading.dismiss();
                                }
                                for (const id of list.membershipIds) {
                                    if (id === (userMembership.userId + '_' + userMembership.groupId)
                                        && (userMembership.userId !== firebase.auth().currentUser.uid)) {
                                        if (this.existsInShared(list.uuid, userMembership.userId, this.sharedLists) === false) {
                                            this.sharedLists.push({item: list, user: userMembership.userId});
                                            this.todoListService.getUser(userMembership.userId).subscribe( user => {
                                                this.usersShared.push(user.username);
                                                this.membershipService.getGroup(userMembership.groupId)
                                                    .subscribe( group => {
                                                    this.groupsShared.push(group.name);
                                                }, () => loading.dismiss());
                                            }, () => loading.dismiss());
                                        }
                                    }
                                }
                            }
                            loading.dismiss();
                            this.sharedListReady = true;
                        }, () => loading.dismiss());
                    }
                }, () => loading.dismiss());
            }
        }, () => loading.dismiss());
    });
  }
  completedItemsSize(list: TodoList) {
    let size = 0;
    for (let i = 0; i < list.items.length; i++) {
      if (list.items[i].complete === false) {
        size++;
      }
    }
    return size;
  }
  viewItems(list: TodoList) {
      if (this.sharedLists.length > 0) {
          for (let i = 0; i < this.sharedLists.length; i++) {
              if (this.sharedLists[i].item.uuid === list.uuid) {
                  console.log(this.sharedLists[i].user);
                  this.router.navigate(['/todo-item'],
                      {queryParams: {
                              id: this.sharedLists[i].item.uuid,
                              name: this.sharedLists[i].item.name,
                              userId: this.sharedLists[i].user
                              }
                      });
                  return;
              }
          }
          this.router.navigate(['/todo-item'], {queryParams: {id: list.uuid, name: list.name}});
      } else {
          this.router.navigate(['/todo-item'], {queryParams: {id: list.uuid, name: list.name}});
      }
  }

  async removeList(list: TodoList) {
      const alert = await this.alertCtrl.create({
          header: 'Confirm!',
          message: 'Are you sure want to delete this list?',
          buttons: [
              {
                  text: 'Cancel',
                  role: 'cancel',
                  cssClass: 'secondary',
                  handler: () => {
                      console.log('cancel');
                  }
              }, {
                  text: 'Delete',
                  handler: () => {
                      this.todoListService.deleteList(firebase.auth().currentUser.uid, list.uuid);
                  }
              }
          ]
      });
      await alert.present();
      await this.slidingList.closeSlidingItems();
  }

    async createList() {
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
                            this.todoListService.addList(firebase.auth().currentUser.uid, {
                                uuid: this.todoListService.makeId(),
                                membershipIds: [],
                                name: data.name,
                                items: [],
                            });
                        } else {
                            this.authService.showToast('The name shouldn\'t be empty');
                        }
                    }
                }
            ]
        });
        await alert.present();
    }

    async modifyList(list: TodoList) {
        const alert = await this.alertCtrl.create({
            header: 'Modifying a to-do list',
            inputs: [
                {
                    name: 'name',
                    type: 'text',
                    value: list.name
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
                    text: 'Modify',
                    handler: data => {
                        if (data.name !== '') {
                            this.todoListService.editList(firebase.auth().currentUser.uid, {
                                uuid: list.uuid,
                                membershipIds: list.membershipIds,
                                name: data.name,
                                items: list.items,
                            });
                        } else {
                            this.authService.showToast('The name shouldn\'t be empty');
                        }
                    }
                }
            ]
        });
        await alert.present();
        await this.slidingList.closeSlidingItems();
    }

    existsInShared(listId, userId, lists) {
        for ( let i = 0; i < lists.length; i++) {
            if (lists[i].user === userId && lists[i].item.uuid === listId) {
                return true;
            }
        }
        return false;
    }

    async presentLoading(loading) {
        return await loading.present();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
