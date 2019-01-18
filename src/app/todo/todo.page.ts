import {Component, OnInit, ViewChild} from '@angular/core';
import {TodoList} from '../models/todoList';
import {TodoServiceProvider} from '../providers/todo-service.provider';
import {Router} from '@angular/router';
import {AlertController, IonList} from '@ionic/angular';

@Component({
  selector: 'app-todo',
  templateUrl: 'todo.page.html',
  styleUrls: ['todo.page.scss']
})
export class TodoPage implements OnInit {
  todoLists: TodoList[];
  @ViewChild('slidingList') slidingList: IonList;

  constructor(public todoListService: TodoServiceProvider, private router: Router, private alertCtrl: AlertController) {}

  ngOnInit() {
    this.todoListService.getList().subscribe( data => this.todoLists = data);
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
            header: 'Confirm!',
            inputs: [
                {
                    name: 'name',
                    type: 'text',
                    placeholder: 'To do item'
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
                        this.todoLists.push({
                            uuid : this.todoListService.makeId(),
                            name : data.name,
                            items : []
                        });
                    }
                }
            ]
        });
        await alert.present();
    }
}
