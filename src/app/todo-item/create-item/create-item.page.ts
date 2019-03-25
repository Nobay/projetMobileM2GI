import {Component, Input, OnInit} from '@angular/core';
import {ModalController, Platform, ToastController} from '@ionic/angular';
import {TodoItem} from '../../models/todoItem';
import {TodoServiceProvider} from '../../providers/todo-service.provider';

import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { File } from '@ionic-native/file/ngx';
import { FilePath } from '@ionic-native/File-Path/ngx';
import * as firebase from 'firebase';
import { LoadingController } from '@ionic/angular';
import {MapItemPage} from './map-item/map-item.page';

@Component({
  selector: 'app-create-item',
  templateUrl: './create-item.page.html',
  styleUrls: ['./create-item.page.scss'],
})
export class CreateItemPage implements OnInit {
  todoItem: TodoItem;
  @Input() data: TodoItem;
  @Input() title: string;
  imgSource: any;
  isLoading = false;

  constructor(
      private todoListService: TodoServiceProvider,
      private toastCtrl: ToastController,
      private fileChooser: FileChooser,
      private file: File,
      private filePath: FilePath,
      private loadingController: LoadingController,
      private modalController: ModalController
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
          this.todoItem = this.data;
      }
  }

    /**
     * whether it's a creation of modification, sends the item data to the main page TodoItemPage
     */
  public async sendItemData() {
      if (this.todoItem.name !== '') {
          this.modalController.dismiss(this.todoItem);
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
      this.modalController.dismiss();
  }

    /**
     * opens the native image chooser of the device and then calls the upload function
     */
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

    /**
     * uploads the image into the firebase storage and awaits the image's url
     * @param buffer
     * @param name
     */
  public async upload(buffer, name) {
    await this.present();
    const blob = new Blob([buffer], {type: 'image/jpeg, image/png'});

    const storage = firebase.storage();

    storage.ref('images/' + name).put(blob).then((d) => {
        storage.ref('images/' + name).getDownloadURL().then((url) => {
            this.imgSource = url;
            this.todoItem.image = url;
          });
          this.dismiss();

    }).catch((error) => {
        alert('not Done');
    });
  }

    /**
     * an on click function opening a new modal page MapItemPage in order to get some coordinates afterwards
     */
  async geolocation() {
      const modal = await this.modalController.create({
          component: MapItemPage,
          componentProps: {title: 'Choose a position'}
      });
      await modal.present();
      const { data } = await modal.onDidDismiss();
      if (data) {
          this.todoItem.latitude = data.coords.lat.toString();
          this.todoItem.longitude = data.coords.lng.toString();
      }
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
