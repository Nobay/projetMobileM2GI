import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {TodoItem} from '../models/todoItem';
import {TodoServiceProvider} from '../providers/todo-service.provider';
import {Subscription} from 'rxjs';
import {AlertController, ModalController} from '@ionic/angular';
import {CreateItemPage} from './create-item/create-item.page';

@Component({
  selector: 'app-todo-item',
  templateUrl: 'todo-item.page.html',
  styleUrls: ['todo-item.page.scss']
})
export class TodoItemPage implements OnInit, OnDestroy {
  listId: string;
  todoItems: TodoItem[] = [];
  subscription: Subscription;

  constructor(
      public todoListService: TodoServiceProvider,
      private route: ActivatedRoute,
      private alertCtrl: AlertController,
      public modalController: ModalController
  ) {}
  ngOnInit() {
      this.subscription = this.route.queryParams.subscribe(params => {
            this.listId = params['id'];
            this.fetchItems();
        });
  }
  fetchItems() {
    if (this.listId) {
        this.todoListService.getTodos(this.listId).subscribe(items => this.todoItems = items);
    }
  }
  getState(item: TodoItem): string {
    if (item.complete) {
      return 'Finished';
    } else {
      return 'Unfinished';
    }
  }

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
                    this.todoListService.deleteTodo(this.listId, item.uuid);
                }
            }
        ]
    });
    await alert.present();
  }
  /** CREATING AN ITEM **/
  async createItem() {
    const modal = await this.modalController.create({
        component: CreateItemPage,
        componentProps: {title: 'Creating an item'}
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data) {
        const alert = await this.alertCtrl.create({
            header: 'Item \'' + data.uuid + ' \' was successfully created !',
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
        this.todoListService.addTodo(this.listId, data);
    }
  }

    /** MODIFYING AN ITEM **/
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
                header: 'Item \'' + data.uuid + '\' was successfully modified !',
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
            this.todoListService.editTodo(this.listId, data);
        }
    }

  ngOnDestroy() {
      this.subscription.unsubscribe();
  }

}
