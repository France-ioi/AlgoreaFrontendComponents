import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemNavComponent } from './item-nav.component';
import { ItemNavigationService } from '../../http-services/item-navigation.service';
import { empty } from 'rxjs';
import { CurrentContentService } from 'src/app/shared/services/current-content.service';

describe('ItemNavComponent', () => {
  let component: ItemNavComponent;
  let fixture: ComponentFixture<ItemNavComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemNavComponent ],
      providers: [
        { provide: ItemNavigationService, useValue: {
          getRootActivities: () => empty()
        }},
        { provide: CurrentContentService, useValue: {
          item: () => empty()
        }},
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
