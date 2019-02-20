import {TodoItem} from './todoItem';

export interface TodoList {
  uuid: string;
  membershipIds: string[];
  name: string;
  items: TodoItem[];
}
