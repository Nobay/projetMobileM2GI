import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {TodoItem} from '../models/todoItem';
import {TodoList} from '../models/todoList';


@Injectable()
export class TodoServiceProvider {
    private todoListsCollection: AngularFirestoreCollection<TodoList>;
    private data: Observable<TodoList[]>;

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
      console.log(uuid);
    return this.todoListsCollection.doc<TodoList>(uuid).valueChanges();
  }

  public addTodo(listUuid: string, item: TodoItem) {
      this.todoListsCollection.doc<TodoList>(listUuid).get().subscribe(doc => {
          const editedItems = doc.data().items;
          editedItems.push(item);
          doc.ref.update({items: editedItems});
      });
  }

  public editTodo(listUuid: string, editedItem: TodoItem) {
      this.todoListsCollection.doc<TodoList>(listUuid).get().subscribe(doc => {
          const editedItems = doc.data().items;
          const index = editedItems.findIndex(value => value.uuid === editedItem.uuid);
          editedItems[index] = editedItem;
          doc.ref.update({items: editedItems});
      });
  }

  public deleteTodo(listUuid: string, uuid: String) {
      this.todoListsCollection.doc<TodoList>(listUuid).get().subscribe(doc => {
          const editedItems = doc.data().items;
          const index = editedItems.findIndex(value => value.uuid === uuid);
          if (index !== -1) {
              editedItems.splice(index, 1);
          }
          doc.ref.update({items: editedItems});
      });
  }

  public addList(list: TodoList) {
      this.todoListsCollection.doc(list.uuid).set(list);
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
      for (let i = 0; i < 3; i++) {
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
