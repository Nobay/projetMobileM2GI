import {Component, Input, OnInit, Output, ElementRef, NgZone} from '@angular/core';
import {ModalController, ToastController} from '@ionic/angular';
import {TodoItem} from '../../models/todoItem';
import {TodoServiceProvider} from '../../providers/todo-service.provider';

import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { File } from '@ionic-native/file/ngx';
import { FilePath } from '@ionic-native/File-Path/ngx';
import * as firebase from 'firebase';

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

  constructor(
      public todoListService: TodoServiceProvider,
      private modalCtrl: ModalController,
      public toastCtrl: ToastController,
      private fileChooser: FileChooser,
      private file: File,
      private filePath: FilePath,
      public zone: NgZone
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
      //alert(uri);

      this.filePath.resolveNativePath(uri).then(filePath => {
        //alert(filePath);
        
        let dirPathSegments = filePath.split('/');
        let fileName = dirPathSegments[dirPathSegments.length-1];
        dirPathSegments.pop();
        let dirPath = dirPathSegments.join('/');
        this.file.readAsArrayBuffer(dirPath, fileName).then(async (buffer) => {
          await this.upload(buffer, fileName);
        }).catch((err) => {
          alert(err.toString());
        });
      });
    });
  }

  public async upload(buffer, name){
    let blob = new Blob([buffer], {type: "image/jpeg, image/png"});

    let storage = firebase.storage();

    storage.ref('images/' + name).put(blob).then((d)=>{
        alert("Image Imported");
        storage.ref('images/' + name).getDownloadURL().then((url) => {
            this.imgsource = url;
            this.todoItem.image = url;
          })

    }).catch((error)=>{
        alert("not Done");
    })  
  }
  
}
