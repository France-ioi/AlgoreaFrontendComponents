import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ItemByIdComponent } from './pages/item-by-id/item-by-id.component';
import { ItemDetailsComponent } from './pages/item-details/item-details.component';
import { ItemEditComponent } from './pages/item-edit/item-edit.component';

@NgModule({
  imports: [ RouterModule.forChild([
    {
      path: 'by-id/:id',
      component: ItemByIdComponent,
      children: [
        {
          path: 'details',
          component: ItemDetailsComponent,
          // Children below do not use routing but there are defined here so that the router can validate the route exists
          children: [
            {
              path: '',
            },
            {
              path: 'progress',
            }
          ]
        },
        {
          path: 'edit',
          component: ItemEditComponent,
        },
      ]
    }
  ]) ],
  exports: [ RouterModule ],
})
export class ItemRoutingModule {}
