import {Component, OnDestroy, OnInit, ViewChild, ChangeDetectorRef} from '@angular/core';
import {TodoList} from '../models/todoList';
import {TodoServiceProvider} from '../providers/todo-service.provider';
import {Router} from '@angular/router';
import {AlertController, IonList, LoadingController, ToastController} from '@ionic/angular';
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
  todoLists: TodoList[] = [];
  sharedLists = [];
  usersShared;
  groupsShared;
  todoListReady = false;
  sharedListReady = false;
  subscription: Subscription;
  initialList;
  initialSharedList;

  @ViewChild('slidingList') slidingList: IonList;

  constructor(
      private todoListService: TodoServiceProvider,
      private authService: AuthServiceProvider,
      private router: Router,
      private alertCtrl: AlertController,
      private membershipService: MembershipServiceProvider,
      private loadingController: LoadingController,
      private cd: ChangeDetectorRef
  ) {}

  async ngOnInit() {
      const loading = await this.loadingController.create({
          message: 'Fetching to-do lists...'
      });
      this.presentLoading(loading);
    this.subscription = this.todoListService.getLists(firebase.auth().currentUser.uid).subscribe( data => {
        this.todoLists = data;
        this.initialList = data;
        this.todoListReady = true;
        this.sharedLists = [];
        this.usersShared = [];
        this.groupsShared = [];
        /* get all the memberships of the connected user */
        this.membershipService.getAllMyGroups(firebase.auth().currentUser.uid).subscribe( memberships => {
            if (memberships.length === 0) {
                loading.dismiss();
            }
            /* loop through the connected user's memberships in which he is also a member (has a membership). */
            for (const membership of memberships) {
                if (membership.hasMembership === true) {
                    /* get all the users of the memberships in which he is also a member */
                    this.membershipService.getAllUsersInGroup(membership.groupId).subscribe(usersInGroup => {
                        if (usersInGroup.length === 0) {
                            loading.dismiss();
                        }
                        for (const userMembership of usersInGroup) {
                            /* for each user, fetch all of his to-do lists */
                            this.todoListService.getLists(userMembership.userId).subscribe( lists => {
                                if (lists.length === 0) {
                                    loading.dismiss();
                                }
                                for (const list of lists)  {
                                    if (list.membershipIds.length === 0) {
                                        loading.dismiss();
                                    }
                                    /* for each list, check whether it's shared with the current user's group (membership) */
                                    for (const id of list.membershipIds) {
                                        if (id === (userMembership.userId + '_' + userMembership.groupId)
                                            && (userMembership.userId !== firebase.auth().currentUser.uid)) {
                                            if (this.existsInShared(list.uuid, userMembership.userId, this.sharedLists) === false) {
                                                this.sharedLists.push({item: list, user: userMembership.userId});
                                                this.initialSharedList = this.sharedLists;
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
            }
            loading.dismiss();
        }, () => loading.dismiss());
    });
  }

    /**
     * takes a list as input and loops through it to return the number of uncompleted items.
     * @param list
     * @return number
     */
  uncompletedItemsSize(list: TodoList): number {
    let size = 0;
    for (let i = 0; i < list.items.length; i++) {
      if (list.items[i].complete === false) {
        size++;
      }
    }
    return size;
  }

    /**
     * takes a list as input and loops through it to return the number of completed items.
     * @param list
     * @return number
     */
  completedItemsSize(list: TodoList): number {
    let size = 0;
    for (let i = 0; i < list.items.length; i++) {
      if (list.items[i].complete === true) {
        size++;
      }
    }
    return size;
  }

    /**
     * loops through an existing shared to-do list and views the clicked list's page, or views his own list.
     * @param list
     */
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

    /**
     * shows an alert box confirming the deletion of a list, which would then be deleted using a CRUD service (based on firebase).
     * @param list
     */
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

    /**
     * shows an alert box with required fields for the creation of a new list, afterwards calls a CRUD service (based on firebase).
     */
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
                            this.authService.showToast('The name is required!');
                        }
                    }
                }
            ]
        });
        await alert.present();
    }

    /**
     * shows an alert box with required fields for the modification of an existing
     * afterwards calls a CRUD service (based on firebase).
     * @param list
     */
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

    /**
     * loops through a collection of shared lists and check whether there are duplicates.
     * @param listId
     * @param userId
     * @param lists
     */
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
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    /**
     * triggered when the search bar is being used,
     * this function filters both the to-do lists and shared lists of the connected user.
     * @param ev
     */
    searchChanged(ev) {
        // set val to the value of the ev target
        const val = ev.target.value;

        // if the value is an empty string don't filter the items
        if (val && val.trim() !== '') {
            this.todoLists = this.todoLists.filter((items) => {
            return (items.name.toLowerCase().indexOf(val.toLowerCase()) > -1);
            });
            this.sharedLists = this.sharedLists.filter((items) => {
                return (items.item.name.toLowerCase().indexOf(val.toLowerCase()) > -1);
                });

        } else if (val.trim() === '' || !val) {
            console.log(this.initialList);
            this.todoLists = this.initialList;
            this.sharedLists = this.initialSharedList;
        }

        if (!this.todoLists) {
            this.todoLists = [];
        }
        if (!this.sharedLists) {
            this.sharedLists = [];
        }
        this.cd.detectChanges();
    }

}
