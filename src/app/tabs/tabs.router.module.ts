import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [

      {
        path: 'todo',
        children: [
          {
            path: '',
            loadChildren: '../todo/todo.module#TodoPageModule'
          }
        ]
      },
      {
        path: 'groups',
        children: [
          {
            path: '',
            loadChildren: '../todo/todo.module#TodoPageModule'
          }
        ]
      },
      {
        path: 'profil',
        children: [
          {
            path: '',
            loadChildren: '../profile/profile.module#ProfilePageModule'
          }
        ]
      },
      {
        path: '',
        redirectTo: '/tabs/todo',
        pathMatch: 'full'
      }
    ]
  }
  ,
      {
        path: '',
        redirectTo: '/tabs/todo',
        pathMatch: 'full'
      }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}