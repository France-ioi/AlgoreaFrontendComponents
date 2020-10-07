import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemRoutingModule } from './item-routing.module';
import { SharedComponentsModule } from '../shared-components/shared-components.module';
import { ItemDetailsComponent } from './pages/item-details/item-details.component';
import { ItemHeaderComponent } from './components/item-header/item-header.component';
import { ItemEditComponent } from './pages/item-edit/item-edit.component';
import { ItemByIdComponent } from './pages/item-by-id/item-by-id.component';

@NgModule({
  declarations: [
    ItemByIdComponent,
    ItemDetailsComponent,
    ItemHeaderComponent,
    ItemEditComponent,
  ],
  imports: [
    CommonModule,
    ItemRoutingModule,
    SharedComponentsModule,
  ]
})
export class ItemModule { }
