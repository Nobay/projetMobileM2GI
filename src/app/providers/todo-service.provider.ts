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

  constructor(db: AngularFirestore) {
    console.log('Hello TodoServiceProvider Provider');
    this.usersCollection = db.collection<User>('users');
  }

    /**
     * using a user's ID and Cloud Firestore, we return an observable of the user's to-do lists
     * @param userId
     * @return Observable<TodoList[]>
     */
  public getLists(userId: string): Observable<TodoList[]> {
      const listCollection = this.usersCollection.doc<User>(userId).collection<TodoList>('todoLists');
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

    /**
     * using a user's ID, a to-do list ID and Cloud Firestore, we return an observable of the user's to-do list
     * @param userId
     * @param uuid
     * @return Observable<TodoList>
     */
  public getTodos(userId: string, uuid: string): Observable<TodoList> {
    return this.usersCollection.doc<User>(userId).collection<TodoList>('todoLists').doc<TodoList>(uuid).valueChanges();
  }

    /**
     * using a user's ID and Cloud Firestore, we return an observable containing the user's data
     * @param userId
     * @return Observable<User>
     */
  public getUser(userId: string): Observable<User> {
      return this.usersCollection.doc<User>(userId).valueChanges();
  }


    /**
     * using a user's ID, a list ID and Cloud Firestore, we add inside a list a to-do item to the array of items.
     * @param userId
     * @param listUuid
     * @param item
     */
  public addTodo(userId: string, listUuid: string, item: TodoItem) {
      this.usersCollection.doc<User>(userId).collection<TodoList>('todoLists').doc<TodoList>(listUuid).get()
          .subscribe(doc => {
          const editedItems = doc.data().items;
          editedItems.push(item);
          doc.ref.update({items: editedItems});
      });
  }

    /**
     * using a user's ID, a list ID and Cloud Firestore, we modify inside a list an existing to-do item.
     * @param userId
     * @param listUuid
     * @param editedItem
     */
  public editTodo(userId: string, listUuid: string, editedItem: TodoItem) {
      this.usersCollection.doc<User>(userId).collection<TodoList>('todoLists').doc<TodoList>(listUuid).get()
          .subscribe(doc => {
          const editedItems = doc.data().items;
          const index = editedItems.findIndex(value => value.uuid === editedItem.uuid);
          editedItems[index] = editedItem;
          doc.ref.update({items: editedItems});
      });
  }

    /**
     * using a user's ID, a list ID and Cloud Firestore, we delete inside a list an existing to-do item from the array of items.
     * @param userId
     * @param listUuid
     * @param uuid
     */
  public deleteTodo(userId: string, listUuid: string, uuid: String) {
      this.usersCollection.doc<User>(userId).collection<TodoList>('todoLists').doc<TodoList>(listUuid).get()
          .subscribe(doc => {
          const editedItems = doc.data().items;
          const index = editedItems.findIndex(value => value.uuid === uuid);
          if (index !== -1) {
              editedItems.splice(index, 1);
          }
          doc.ref.update({items: editedItems});
      });
  }

    /**
     * using a user's ID and Cloud Firestore, we insert a to-do list into the user's collection of to-do lists.
     * @param userId
     * @param list
     */
  public addList(userId: string, list: TodoList) {
      this.usersCollection.doc<User>(userId).collection<TodoList>('todoLists').doc(list.uuid).set(list);
  }

    /**
     * using a user's ID and Cloud Firestore, we modify an existing to-do list in the user's collection of to-do lists.
     * @param userId
     * @param editedList
     */
  public editList(userId: string, editedList: TodoList) {
      this.usersCollection.doc<User>(userId).collection<TodoList>('todoLists').doc<TodoList>(editedList.uuid)
          .update(editedList);
  }

    /**
     * using a user's ID and Cloud Firestore, we delete an existing to-do list from the user's collection of to-do lists.
     * @param userId
     * @param listUuid
     */
  public deleteList(userId: string, listUuid: string) {
      this.usersCollection.doc<User>(userId).collection<TodoList>('todoLists').doc<TodoList>(listUuid).delete();
  }

    /**
     * using Cloud Firestore, we insert a user into the collection of users.
     * @param user
     */
  public addUser(user: User) {
        this.usersCollection.doc(user.uuid).set(user);
  }

    /**
     * using Cloud Firestore, we remove a user from the collection of users.
     * @param userId
     */
  public removeUser(userId: string) {
      this.usersCollection.doc(userId).delete();
  }

    /**
     * generates a random ID for the creation of documents.
     * @return string
     */
  public makeId(): string {
      return Math.random().toString(36).substr(2, 12);
  }
}
