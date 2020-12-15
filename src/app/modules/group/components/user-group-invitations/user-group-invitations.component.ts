import { Component, OnDestroy } from '@angular/core';
import { MessageService } from 'primeng/api';
import { merge, of, Subject } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { GridColumn } from 'src/app/modules/shared-components/components/grid/grid.component';
import { displayResponseToast, processRequestError } from 'src/app/modules/group/helpers/response-toast';
import { fetchingState, readyState, isReady } from 'src/app/shared/helpers/state';
import { GetRequestsService, PendingRequest } from '../../http-services/get-requests.service';
import { Action, RequestActionsService } from '../../http-services/request-actions.service';
import { processRequests, parseResults } from '../pending-request/request-processing';

@Component({
  selector: 'alg-user-group-invitations',
  templateUrl: './user-group-invitations.component.html',
  styleUrls: [ './user-group-invitations.component.scss' ]
})
export class UserGroupInvitationsComponent implements OnDestroy {
  requests: PendingRequest[] = [];

  columns: GridColumn[] = [
    { field: 'group.name', header: 'TITLE' },
    { field: 'group.type', header: 'TYPE' },
    { field: 'at', header: 'REQUESTED ON' },
  ];

  state: 'fetching' | 'processing' | 'ready' | 'fetchingError' = 'fetching';
  currentSort: string[] = [];

  private dataFetching = new Subject<{ sort: string[] }>();

  constructor(
    private getRequestsService: GetRequestsService,
    private requestActionService: RequestActionsService,
    private messageService: MessageService,
  ) {
    this.dataFetching.pipe(
      switchMap(params =>
        merge(
          of(fetchingState()),
          this.getRequestsService.getGroupInvitations(params.sort)
            .pipe(map(readyState))
        )
      )
    ).subscribe(
      state => {
        this.state = state.tag;
        if (isReady(state)) {
          this.requests = state.data;
        }
      },
      _err => {
        this.state = 'fetchingError';
      }
    );
  }

  ngOnDestroy(): void {
    this.dataFetching.complete();
  }

  onProcessRequests(params: { data: PendingRequest[], type: Action }): void {
    processRequests(
      (groupId: string, _memberIds: string[], action: Action) => this.requestActionService.processGroupInvitation(groupId, action),
      params.type,
      params.data
    )
      .subscribe(
        result => {
          this.state = 'ready';

          displayResponseToast(
            this.messageService,
            parseResults(result),
            params.type === Action.Accept ? 'accept' : 'reject',
            params.type === Action.Accept ? 'accepted' : 'declined'
          );

        },
        _err => {
          this.state = 'ready';
          processRequestError(this.messageService);
        }
      );
  }

  onFetch(sort: string[]): void {
    if (JSON.stringify(sort) !== JSON.stringify(this.currentSort)) {
      this.currentSort = sort;
      this.dataFetching.next({ sort: this.currentSort });
    }
  }
}
