import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import {AuthGuard} from '../providers/auth-guard';

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
            loadChildren: '../todo/todo.module#TodoPageModule',
            canActivate: [AuthGuard],
          }
        ]
      },
      {
        path: 'groups',
        children: [
          {
            path: '',
            loadChildren: '../groups/groups.module#GroupsPageModule',
            canActivate: [AuthGuard],
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
      }/* ,
      {
        path: '',
        redirectTo: '/tabs/profil',
        pathMatch: 'full'
      } */
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
