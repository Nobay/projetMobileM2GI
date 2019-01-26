import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {TodoList} from '../models/todoList';
import {TodoServiceProvider} from '../providers/todo-service.provider';
import {Router} from '@angular/router';
import {AlertController, IonList, ToastController} from '@ionic/angular';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-todo',
  templateUrl: 'todo.page.html',
  styleUrls: ['todo.page.scss']
})
export class TodoPage implements OnInit, OnDestroy {
  todoLists: TodoList[];
  todoListReady = false;
  subscription: Subscription;
  @ViewChild('slidingList') slidingList: IonList;

  constructor(
      public todoListService: TodoServiceProvider,
      private router: Router,
      private alertCtrl: AlertController,
      private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.subscription = this.todoListService.getList().subscribe( data => {
        this.todoLists = data;
        this.todoListReady = true;
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
      this.router.navigate(['/todo-item'], {queryParams: {id: list.uuid}});
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
                      this.todoListService.deleteList(list.uuid);
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
                            this.todoListService.addList({
                                uuid : this.todoListService.makeId(),
                                name : data.name,
                                items : []
                            });
                        } else {
                            this.showErrorToast('The name shouldn\'t be empty');
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
                            this.todoListService.editList({
                                uuid : list.uuid,
                                name : data.name,
                                items : list.items
                            });
                        } else {
                            this.showErrorToast('The name shouldn\'t be empty');
                        }
                    }
                }
            ]
        });
        await alert.present();
    }

    async showErrorToast(data: any) {
        const toast = await this.toastCtrl.create({
            message: data,
            duration: 2000,
            position: 'top'
        });
        toast.present();
    }
    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
