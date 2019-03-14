import {TodoItem} from './todoItem';

/**
 * an interface that holds the data of a to-do list, and also the list of membership IDs in which it is shared.
 */
export interface TodoList {
  uuid: string;
  membershipIds: string[];
  name: string;
  items: TodoItem[];
}
