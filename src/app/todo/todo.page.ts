import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {TodoList} from '../models/todoList';
import {TodoServiceProvider} from '../providers/todo-service.provider';
import {Router} from '@angular/router';
import {AlertController, IonList, ToastController} from '@ionic/angular';
import {Subscription} from 'rxjs';
import {AuthServiceProvider} from '../providers/auth-service.provider';
import * as firebase from 'firebase';
import {MembershipServiceProvider} from '../providers/membership-service.provider';

@Component({
  selector: 'app-todo',
  templateUrl: 'todo.page.html',
  styleUrls: ['todo.page.scss']
})
export class TodoPage implements OnInit, OnDestroy {
  todoLists: TodoList[];
  sharedLists: TodoList[] = [];
  usersShared: string[];
  groupsShared: string[];
  todoListReady = false;
  sharedListReady = false;
  subscription: Subscription;
  @ViewChild('slidingList') slidingList: IonList;

  constructor(
      private todoListService: TodoServiceProvider,
      private authService: AuthServiceProvider,
      private router: Router,
      private alertCtrl: AlertController,
      private membershipService: MembershipServiceProvider
  ) {}

  ngOnInit() {
    this.subscription = this.todoListService.getLists(firebase.auth().currentUser.uid).subscribe( data => {
        this.todoLists = data;
        this.todoListReady = true;
    });
    this.membershipService.getAllMyGroups(firebase.auth().currentUser.uid).subscribe( memberships => {
        for (const membership of memberships) {
            this.todoListService.getLists(membership.userId).subscribe( lists => {
                for (const list of lists)  {
                    for (const id of list.membershipIds) {
                        if (id === (membership.userId + '_' + membership.groupId)) {
                            this.sharedLists.push(list);
                            this.todoListService.getUser(membership.userId).subscribe( user => {
                                this.usersShared.push(user.username);
                                this.membershipService.getGroup(membership.groupId).subscribe( group => {
                                    this.groupsShared.push(group.name);
                                    this.sharedListReady = true;
                                });
                            });
                        }
                    }
                }
            });
        }
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
      this.router.navigate(['/todo-item'], {queryParams: {id: list.uuid, name: list.name}});
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
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
