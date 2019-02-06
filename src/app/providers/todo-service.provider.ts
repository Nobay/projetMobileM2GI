import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {TodoItem} from '../models/todoItem';
import {TodoList} from '../models/todoList';
import {User} from '../models/user';


@Injectable()
export class TodoServiceProvider {
    private usersCollection: AngularFirestoreCollection<User>;
    private data: Observable<User[]>;

  constructor(db: AngularFirestore) {
    console.log('Hello TodoServiceProvider Provider');
    this.usersCollection = db.collection<User>('users');
    this.data = this.usersCollection.snapshotChanges().pipe(
        map(actions => {
            return actions.map(a => {
                const data = a.payload.doc.data();
                const id = a.payload.doc.id;
                return { id, ...data};
            });
        })
    );
  }

  public getUsers(): Observable<User[]> {
    return this.data;
  }

  public getLists(email: string): Observable<TodoList[]> {
      const listCollection = this.usersCollection.doc<User>(email).collection<TodoList>('todoLists');
      return listCollection.snapshotChanges().pipe(
          map(actions => {
              return actions.map(a => {
                  const data = a.payload.doc.data();
                  const id = a.payload.doc.id;
                  return { id, ...data};
              });
          })
      );
  }

  public getTodos(email: string, uuid: string): Observable<TodoList> {
    return this.usersCollection.doc<User>(email).collection<TodoList>('todoLists').doc<TodoList>(uuid).valueChanges();
  }

  public addTodo(email: string, listUuid: string, item: TodoItem) {
      this.usersCollection.doc<User>(email).collection<TodoList>('todoLists').doc<TodoList>(listUuid).get()
          .subscribe(doc => {
          const editedItems = doc.data().items;
          editedItems.push(item);
          doc.ref.update({items: editedItems});
      });
  }

  public editTodo(email: string, listUuid: string, editedItem: TodoItem) {
      this.usersCollection.doc<User>(email).collection<TodoList>('todoLists').doc<TodoList>(listUuid).get()
          .subscribe(doc => {
          const editedItems = doc.data().items;
          const index = editedItems.findIndex(value => value.uuid === editedItem.uuid);
          editedItems[index] = editedItem;
          doc.ref.update({items: editedItems});
      });
  }

  public deleteTodo(email: string, listUuid: string, uuid: String) {
      this.usersCollection.doc<User>(email).collection<TodoList>('todoLists').doc<TodoList>(listUuid).get()
          .subscribe(doc => {
          const editedItems = doc.data().items;
          const index = editedItems.findIndex(value => value.uuid === uuid);
          if (index !== -1) {
              editedItems.splice(index, 1);
          }
          doc.ref.update({items: editedItems});
      });
  }

  public addList(email: string, list: TodoList) {
      this.usersCollection.doc<User>(email).collection<TodoList>('todoLists').doc(list.uuid).set(list);
  }

  public editList(email: string, editedList: TodoList) {
      this.usersCollection.doc<User>(email).collection<TodoList>('todoLists').doc<TodoList>(editedList.uuid)
          .update(editedList);
  }

  public deleteList(email: string, listUuid: string) {
      this.usersCollection.doc<User>(email).collection<TodoList>('todoLists').doc<TodoList>(listUuid).delete();
  }

  public addUser(user: User) {
        this.usersCollection.doc(user.email).set(user);
  }

  public removeUser(email: string) {
      this.usersCollection.doc(email).delete();
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
