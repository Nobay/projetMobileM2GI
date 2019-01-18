import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
    { path: '', loadChildren: './tabs/tabs.module#TabsPageModule' },
    { path: 'todo-item', loadChildren: './todo-item/todo-item.module#TodoItemPageModule' },
    { path: 'create-item', loadChildren: './todo-item/create-item/create-item.module#CreateItemPageModule' }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
