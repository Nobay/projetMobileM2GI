import {Component, Input, OnInit} from '@angular/core';
import {ModalController, ToastController} from '@ionic/angular';
import {TodoItem} from '../../models/todoItem';
import {TodoServiceProvider} from '../../providers/todo-service.provider';

import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { File } from '@ionic-native/file/ngx';
import { FilePath } from '@ionic-native/File-Path/ngx';
import * as firebase from 'firebase';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-create-item',
  templateUrl: './create-item.page.html',
  styleUrls: ['./create-item.page.scss'],
})
export class CreateItemPage implements OnInit {
  todoItem: TodoItem;
  @Input() data: TodoItem;
  @Input() title: string;
  imgsource: any;
  isLoading = false;

  constructor(
      public todoListService: TodoServiceProvider,
      private modalCtrl: ModalController,
      public toastCtrl: ToastController,
      private fileChooser: FileChooser,
      private file: File,
      private filePath: FilePath,
      public loadingController: LoadingController
  ) {
    this.todoItem = {
        uuid : todoListService.makeId(),
        name : '',
        complete : false,
        desc: '',
        image: ''
    };
  }
  ngOnInit() {
    if (this.data) {
      this.todoItem = {
          uuid : this.data.uuid,
          name : this.data.name,
          complete : this.data.complete,
          desc: this.data.desc,
          image: this.data.image
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

  choose() {
    this.fileChooser.open().then((uri) => {

      this.filePath.resolveNativePath(uri).then(filePath => {
        const dirPathSegments = filePath.split('/');
        const fileName = dirPathSegments[dirPathSegments.length - 1];
        dirPathSegments.pop();
        const dirPath = dirPathSegments.join('/');
        this.file.readAsArrayBuffer(dirPath, fileName).then(async (buffer) => {
          await this.upload(buffer, fileName);
        }).catch((err) => {
          alert(err.toString());
        });
      });
    });
  }

  public async upload(buffer, name) {
    await this.present();
    const blob = new Blob([buffer], {type: 'image/jpeg, image/png'});

    const storage = firebase.storage();

    storage.ref('images/' + name).put(blob).then((d) => {
        storage.ref('images/' + name).getDownloadURL().then((url) => {
            this.imgsource = url;
            this.todoItem.image = url;
          });
          this.dismiss();

    }).catch((error) => {
        alert('not Done');
    });
  }

  async present() {
    this.isLoading = true;
    return await this.loadingController.create({
      message: 'Uploading image',
      duration: 5000,
    }).then(a => {
      a.present().then(() => {
        if (!this.isLoading) {
          a.dismiss().then(() => console.log('abort presenting'));
        }
      });
    });
  }

  async dismiss() {
    this.isLoading = false;
    return await this.loadingController.dismiss().then(() => console.log('dismissed'));
  }
}
