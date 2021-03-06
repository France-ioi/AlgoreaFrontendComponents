import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { appDefaultItemRoute, urlStringForItemRoute } from '../shared/routing/item-route';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: urlStringForItemRoute(appDefaultItemRoute('activity')),
    pathMatch: 'full',
  },
  {
    path: 'groups',
    loadChildren: (): Promise<any> => import('../modules/group/group.module').then(m => m.GroupModule)
  },
  {
    path: 'activities',
    loadChildren: (): Promise<any> => import('../modules/item/item.module').then(m => m.ItemModule)
  },
  {
    path: 'skills',
    loadChildren: (): Promise<any> => import('../modules/item/item.module').then(m => m.ItemModule)
  },
  {
    path: '**',
    component: PageNotFoundComponent,
  }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes, { useHash: true }) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
