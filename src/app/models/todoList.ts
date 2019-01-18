import {TodoItem} from './todoItem';

export interface TodoList {
  uuid: string;
  name: string;
  items: TodoItem[];
}
