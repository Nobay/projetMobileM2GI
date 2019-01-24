import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import {Observable} from 'rxjs';
import { of } from 'rxjs';
import {map} from 'rxjs/operators';
import {TodoItem} from '../models/todoItem';
import {TodoList} from '../models/todoList';


@Injectable()
export class TodoServiceProvider {
    private todoListsCollection: AngularFirestoreCollection<TodoList>;
    private data: Observable<TodoList[]>;
  /*data: TodoList[] = [
    {
      uuid : 'a351e558-29ce-4689-943c-c3e97be0df8b',
      name : 'List 1',
      items : [
        {
          uuid : '7dc94eb4-d4e9-441b-b06b-0ca29738c8d2',
          name : 'Item 1-1',
          complete : false
        },
        {
          uuid : '20c09bdd-1cf8-43b0-9111-977fc4d343bc',
          name : 'Item 1-2',
          complete : false
        },
        {
          uuid : 'bef88351-f4f1-4b6a-965d-bb1a4fa3b444',
          name : 'Item 1-3',
          complete : true
        }
      ]
    },
    { uuid : '90c04913-c1a2-47e5-9535-c7a430cdcf9c',
      name : 'List 2',
      items : [
        {
          uuid : '72849f5f-2ef6-444b-98b0-b50fc019f97c',
          name : 'Item 2-1',
          complete : false
        },
        {
          uuid : '80d4cbbe-1c64-4603-8d00-ee4932045333',
          name : 'Item 2-2',
          complete : true
        },
        {
          uuid : 'a1cd4568-590b-428b-989d-165f22365485',
          name : 'Item 2-3',
          complete : true
        }
      ]
    }
  ];*/

  constructor(db: AngularFirestore) {
    console.log('Hello TodoServiceProvider Provider');
    this.todoListsCollection = db.collection<TodoList>('todoLists');
    this.data = this.todoListsCollection.snapshotChanges().pipe(
        map(actions => {
            return actions.map(a => {
                const data = a.payload.doc.data();
                const id = a.payload.doc.id;
                return { id, ...data};
            });
        })
    );
  }

  public getList(): Observable<TodoList[]> {
    return this.data;
  }

  public getTodos(uuid: string): Observable<TodoList> {
    return this.todoListsCollection.doc<TodoList>(uuid).valueChanges();
  }

  public addTodo(listUuid: string, item: TodoItem) {
      const list = this.getTodos(listUuid);
      list.subscribe( data => {
          data.items.push(item);
          this.todoListsCollection.doc<TodoList>(listUuid).update(data);
      });
  }

  public editTodo(listUuid: string, editedItem: TodoItem) {
      const list = this.getTodos(listUuid);
      list.subscribe( data => {
          const index = data.items.findIndex(value => value.uuid === editedItem.uuid);
          data.items[index] = editedItem;
          this.todoListsCollection.doc<TodoList>(listUuid).update(data);
      });
  }

  public deleteTodo(listUuid: string, uuid: String) {
      const list = this.getTodos(listUuid);
      list.subscribe( data => {
          const index = data.items.findIndex(value => value.uuid === uuid);
          if (index !== -1) {
              data.items.splice(index, 1);
          }
          this.todoListsCollection.doc<TodoList>(listUuid).update(data);
      });
  }

  public addList(list: TodoList) {
      this.todoListsCollection.add(list);
  }
  public editList(editedList: TodoList) {
    this.todoListsCollection.doc<TodoList>(editedList.uuid).update(editedList);
  }

  public deleteList(listUuid: string) {
      this.todoListsCollection.doc<TodoList>(listUuid).delete();
  }

  public makeId(): string {
      let text = '';
      const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

      for (let i = 0; i < 8; i++) {
          text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      for (let i = 0; i < 3; i++){
          for (let j = 0; j < 4; j++) {
              text += possible.charAt(Math.floor(Math.random() * possible.length));
          }
          text += '-';
      }
      for (let i = 0; i < 12; i++) {
          text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return text;
  }
}
