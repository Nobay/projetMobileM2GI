import {TodoList} from './todoList';

export interface Membership {
    userId: string;
    groupId: string;
    hasMembership: boolean;
    isOwner: boolean;
    date: number;
}
