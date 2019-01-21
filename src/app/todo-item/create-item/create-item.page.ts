import {Component, Input, OnInit, Output} from '@angular/core';
import {ModalController} from '@ionic/angular';
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
  constructor(public todoListService: TodoServiceProvider, private modalCtrl: ModalController) {
    this.todoItem = {
        uuid : todoListService.makeId(),
        name : '',
        complete : false,
        desc: ''
    };
  }
  ngOnInit() {
    if (this.data) {
      this.todoItem = this.data;
    }
  }

  public sendItemData() {
    this.modalCtrl.dismiss(this.todoItem);
  }
  public cancelCreation() {
      this.modalCtrl.dismiss();
  }
}
