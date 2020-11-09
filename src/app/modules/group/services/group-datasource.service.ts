import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, concat, of, Subject } from 'rxjs';
import { catchError, filter, map, switchMap } from 'rxjs/operators';
import { errorState, FetchError, Fetching, fetchingState, isReady, Ready, readyState } from 'src/app/shared/helpers/state';
import { GetGroupByIdService, Group } from '../http-services/get-group-by-id.service';

type GroupId = string;

/**
 * A datasource which allows fetching a group using a proper state and sharing it among several components.
 * The only interactions with this class are:
 * - trigger actions by calling public functions
 * - listen state change by listening the state
 */
@Injectable()
export class GroupDataSource implements OnDestroy {

  private state = new BehaviorSubject<Ready<Group>|Fetching|FetchError>(fetchingState());
  state$ = this.state.asObservable();
  group$ = this.state.pipe( // only fetched groups, to be use in template as it cannot properly infer types
    filter<Ready<Group>|Fetching|FetchError, Ready<Group>>(isReady),
    map(s => s.data)
  )

  private fetchOperation = new Subject<GroupId>(); // trigger item fetching

  constructor(
    private getGroupByIdService: GetGroupByIdService,
  ) {
    this.fetchOperation.pipe(

      // switchMap does cancel the previous ongoing processing if a new one comes
      // on new fetch operation to be done: set "fetching" stae and fetch the data which will result in a ready or error state
      switchMap(id =>
        concat(
          of(fetchingState()),
          this.getGroupByIdService.get(id).pipe(
            map(res => readyState(res)),
            catchError(e => of(errorState(e)))
          )
        )
      ),

    ).subscribe(state => this.state.next(state));
  }

  fetchGroup(id: GroupId): void {
    this.fetchOperation.next(id);
  }

  // If (and only if) a group is currently fetched (so we are not currently loading or in error), refetch it.
  refetchGroup(): void {
    if (isReady(this.state.value)) {
      this.fetchOperation.next(this.state.value.data.id);
    }
  }

  ngOnDestroy(): void {
    this.state.complete();
    this.fetchOperation.complete();
  }

}
