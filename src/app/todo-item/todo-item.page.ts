import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {TodoItem} from '../models/todoItem';
import {TodoServiceProvider} from '../providers/todo-service.provider';
import {Subscription} from 'rxjs';
import {AlertController, LoadingController, ModalController} from '@ionic/angular';
import {CreateItemPage} from './create-item/create-item.page';
import * as firebase from 'firebase';

@Component({
  selector: 'app-todo-item',
  templateUrl: 'todo-item.page.html',
  styleUrls: ['todo-item.page.scss']
})
export class TodoItemPage implements OnInit, OnDestroy {
  listId: string;
  listName: string;
  userId: string;
  todoItems: TodoItem[] = [];
  subscription: Subscription;
  loading;

  constructor(
      private todoListService: TodoServiceProvider,
      private route: ActivatedRoute,
      private alertCtrl: AlertController,
      private modalController: ModalController,
      private loadingController: LoadingController
  ) {}
  async ngOnInit() {
      this.loading = await this.loadingController.create({
          message: 'Fetching items...'
      });
      this.presentLoading(this.loading);
      this.subscription = this.route.queryParams.subscribe(params => {
          console.log(params);
            this.listId = params['id'];
            this.listName = params['name'];
            this.userId = params['userId'];
            /* if the parameter 'userId' exists, then, in this case, it's not our connected user's list */
            if (this.userId) {
                this.fetchItems(this.userId);
            } else {
                this.fetchItems(firebase.auth().currentUser.uid);
            }
        }, () => this.loading.dismiss());
  }

    /**
     * fetches for the items of the connected user, using a CRUD service.
     * @param userId
     */
  fetchItems(userId) {
    if (this.listId) {
        this.todoListService.getTodos(userId, this.listId)
            .subscribe(data => {
                this.todoItems = data.items;
                this.loading.dismiss();
            }, () => this.loading.dismiss());
    } else {
        this.loading.dismiss();
    }
  }

    /**
     * gets the state of an item
     * @param item
     */
  getState(item: TodoItem): string {
    if (item.complete) {
      return 'Finished';
    } else {
      return 'Unfinished';
    }
  }

    /**
     * shows an alert box confirming the deletion of an item, which would then be deleted using a CRUD service (based on firebase).
     * @param item
     */
  async removeItem(item: TodoItem) {
    const alert = await this.alertCtrl.create({
        header: 'Confirm!',
        message: 'Are you sure want to delete this item?',
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
                    this.todoListService.deleteTodo(firebase.auth().currentUser.uid, this.listId, item.uuid);
                }
            }
        ]
    });
    await alert.present();
  }

    /**
     * shows an alert box with required fields for the creation of a new to-do item (while opening a new modal CreateItemPage),
     * afterwards calls a CRUD service.
     */
  async createItem() {
    const modal = await this.modalController.create({
        component: CreateItemPage,
        componentProps: {title: 'Creating an item'}
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data) {
        console.log(data);
        const alert = await this.alertCtrl.create({
            header: 'Item successfully created !',
            buttons: [
                {
                    text: 'Continue',
                    cssClass: 'secondary',
                    handler: () => {
                        console.log('continue');
                    }
                }
            ]
        });
        await alert.present();
        this.todoListService.addTodo(firebase.auth().currentUser.uid, this.listId, data);
    }
  }

    /**
     * shows an alert box with required fields for the modification
     * of an existing to-do item (while opening a new modal CreateItemPage),
     * afterwards calls a CRUD service.
     */
    async modifyItem(item: TodoItem) {
        const modal = await this.modalController.create({
            component: CreateItemPage,
            componentProps: {title: 'Modifying an item', data: item}
        });
        await modal.present();
        const { data } = await modal.onDidDismiss();
        console.log(item.name);
        if (data) {
            const alert = await this.alertCtrl.create({
                header: 'Item successfully modified !',
                buttons: [
                    {
                        text: 'Continue',
                        cssClass: 'secondary',
                        handler: () => {
                            console.log('continue');
                        }
                    }
                ]
            });
            await alert.present();
            this.todoListService.editTodo(firebase.auth().currentUser.uid, this.listId, data);
        }
    }

    async presentLoading(loading) {
        return await loading.present();
    }

  ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
  }

}
