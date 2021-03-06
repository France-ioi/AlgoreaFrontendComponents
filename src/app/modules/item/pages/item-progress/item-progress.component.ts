import { Component, Input, OnChanges, ViewChild } from '@angular/core';
import { UserSessionService } from 'src/app/shared/services/user-session.service';
import { ItemData } from '../../services/item-datasource.service';
import { RouterLinkActive } from '@angular/router';
import { ItemType } from '../../../../shared/helpers/item-type';

@Component({
  selector: 'alg-item-progress',
  templateUrl: './item-progress.component.html',
  styleUrls: [ './item-progress.component.scss' ]
})
export class ItemProgressComponent implements OnChanges {

  @Input() itemData?: ItemData;

  @ViewChild('historyTab') historyTab?: RouterLinkActive;
  @ViewChild('chapterGroupProgressTab') chapterGroupProgressTab?: RouterLinkActive;
  @ViewChild('chapterUserProgressTab') chapterUserProgressTab?: RouterLinkActive;

  readonly session$ = this.sessionService.session$;

  selectors: 'none' | 'withUserProgress' | 'withGroupProgress' = 'withUserProgress';

  constructor(private sessionService: UserSessionService) {}

  ngOnChanges(): void {
    if (!this.itemData) {
      return;
    }

    this.recomputeSelector(this.itemData.item.type);
  }

  private recomputeSelector(type: ItemType): void {
    const isCurrentlyWatching = this.sessionService.isCurrentlyWatching;

    if (!isCurrentlyWatching && [ 'Task', 'Course' ].includes(type)) {
      this.selectors = 'none';
    } else if (!isCurrentlyWatching && ![ 'Task', 'Course' ].includes(type)) {
      this.selectors = 'withUserProgress';
    } else {
      this.selectors = 'withGroupProgress';
    }
  }
}
