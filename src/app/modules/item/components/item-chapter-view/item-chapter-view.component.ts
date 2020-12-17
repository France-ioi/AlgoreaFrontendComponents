import { Component, Input } from '@angular/core';
import { of } from 'rxjs';
import { delay, switchMap } from 'rxjs/operators';
import { GetGroupByIdService } from 'src/app/modules/group/http-services/get-group-by-id.service';
import { UserSessionService } from 'src/app/shared/services/user-session.service';
import { ItemData } from '../../services/item-datasource.service';

@Component({
  selector: 'alg-item-chapter-view',
  templateUrl: './item-chapter-view.component.html',
  styleUrls: [ './item-chapter-view.component.scss' ]
})
export class ItemChapterViewComponent {

  @Input() itemData?: ItemData;

  session$ = this.sessionService.session$.pipe(switchMap(session => of(session === undefined ? undefined : {
    user: session.user,
    watchedGroup: session.watchedGroup ? this.getGroupByIdService.get(session?.watchedGroup?.id) : undefined,
  })));

  constructor(
    private sessionService: UserSessionService,
    private getGroupByIdService:GetGroupByIdService,
  ) {}
}
