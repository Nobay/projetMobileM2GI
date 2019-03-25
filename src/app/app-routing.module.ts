import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', loadChildren: './authentication/authentication.module#AuthenticationPageModule' },
  { path: 'todo', loadChildren: './todo/todo.module#TodoPageModule' },
  { path: 'todo-item', loadChildren: './todo-item/todo-item.module#TodoItemPageModule' },
  { path: 'create-item', loadChildren: './todo-item/create-item/create-item.module#CreateItemPageModule' },
  { path: 'signup', loadChildren: './signup/signup.module#SignupPageModule' },
  { path: 'tabs', loadChildren: './tabs/tabs.module#TabsPageModule' },
  { path: 'groups', loadChildren: './groups/groups.module#GroupsPageModule' },
  { path: 'group', loadChildren: './group/group.module#GroupPageModule' },
  { path: 'map-item', loadChildren: './todo-item/create-item/map-item/map-item.module#MapItemPageModule' }





];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
