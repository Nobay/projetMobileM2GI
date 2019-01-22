import {Component, Input, OnInit, Output} from '@angular/core';
import {ModalController, ToastController} from '@ionic/angular';
import {TodoItem} from '../../models/todoItem';
import {TodoServiceProvider} from '../../providers/todo-service.provider';

@Component({
  selector: 'app-create-item',
  templateUrl: './create-item.page.html',
  styleUrls: ['./create-item.page.scss'],
})
export class CreateItemPage implements OnInit {
  todoItem: TodoItem;
  @Input() data: TodoItem;
  @Input() title: string;
  constructor(
      public todoListService: TodoServiceProvider,
      private modalCtrl: ModalController,
      public toastCtrl: ToastController
  ) {
    this.todoItem = {
        uuid : todoListService.makeId(),
        name : '',
        complete : false,
        desc: ''
    };
  }
  ngOnInit() {
    if (this.data) {
      this.todoItem = {
          uuid : this.data.uuid,
          name : this.data.name,
          complete : this.data.complete,
          desc: this.data.desc
      };
    }
  }

  public async sendItemData() {
      if (this.todoItem.name !== '') {
          this.modalCtrl.dismiss(this.todoItem);
      } else {
          const toast = await this.toastCtrl.create({
              message: 'The name fields shouldn\'t be empty',
              duration: 2000,
              position: 'top'
          });
          toast.present();
      }
  }
  public cancelCreation() {
      this.modalCtrl.dismiss();
  }
}
