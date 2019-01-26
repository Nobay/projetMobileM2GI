import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
    { path: '', loadChildren: './authentication/authentication.module#AuthenticationPageModule' },
    { path: 'todo', loadChildren: './todo/todo.module#TodoPageModule' },
    { path: 'todo-item', loadChildren: './todo-item/todo-item.module#TodoItemPageModule' },
    { path: 'create-item', loadChildren: './todo-item/create-item/create-item.module#CreateItemPageModule' },
    { path: 'profile', loadChildren: './profile/profile.module#ProfilePageModule' }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
