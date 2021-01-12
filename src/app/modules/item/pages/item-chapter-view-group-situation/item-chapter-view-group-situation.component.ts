import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { forkJoin, merge, Observable, of, Subject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Group } from 'src/app/modules/group/http-services/get-group-by-id.service';
import { GetGroupChildrenService } from 'src/app/modules/group/http-services/get-group-children.service';
import { fetchingState, isReady, readyState } from 'src/app/shared/helpers/state';
import { formatUser } from 'src/app/shared/helpers/user';
import { GetGroupDescendantsService } from 'src/app/shared/http-services/get-group-descendants.service';
import { GetGroupProgressService } from 'src/app/shared/http-services/get-group-progress.service';
import { TypeFilter } from '../../components/composition-filter/composition-filter.component';
import { Permissions } from '../../components/permissions-edit-dialog/permissions-edit-dialog.component';
import { GetItemChildrenService } from '../../http-services/get-item-children.service';
import { ItemData } from '../../services/item-datasource.service';

export interface Progress {
  groupId: string,
  itemId: string,
  validated: boolean,
  score: number,
  timeSpent: number,
}

interface Data {
  type: TypeFilter,
  items: {
    id: string,
    title: string|null,
  }[],
  rows: {
    header: string,
    id: string,
    data: (Progress|undefined)[],
  }[],
  can_access: boolean,
}

@Component({
  selector: 'alg-item-chapter-view-group-situation',
  templateUrl: './item-chapter-view-group-situation.component.html',
  styleUrls: [ './item-chapter-view-group-situation.component.scss' ]
})
export class ItemChapterViewGroupSituationComponent implements OnChanges, OnDestroy {

  @Input() group?: Group;
  @Input() itemData?: ItemData;

  defaultFilter: TypeFilter = 'Users';

  currentFilter = this.defaultFilter;

  state: 'error' | 'ready' | 'fetching' = 'fetching';

  data: Data = {
    type: this.defaultFilter,
    items: [],
    rows: [],
    can_access: false,
  }

  permissions: Permissions = {
    can_view: 'none',
    can_grant_view: 'none',
    can_watch: 'none',
    can_edit: 'none',
    can_make_session_official: false,
    is_owner: true,
  };

  dialog: 'loading'|'opened'|'closed' = 'closed';
  dialogTitle = '';

  private dataFetching = new Subject<{ groupId: string, itemId: string, attemptId: string, filter: TypeFilter }>();

  constructor(
    private getItemChildrenService: GetItemChildrenService,
    private getGroupDescendantsService: GetGroupDescendantsService,
    private getGroupUsersProgressService: GetGroupProgressService,
    private getGroupChildrenService: GetGroupChildrenService,
  ) {
    this.dataFetching.pipe(
      switchMap(params =>
        merge(
          of(fetchingState()),
          this.getData(params.itemId, params.groupId, params.attemptId, params.filter).pipe(map(readyState))
        )
      )).subscribe(
      state => {
        this.state = state.tag;
        if (isReady(state)) this.data = state.data;
      },
      _err => {
        this.state = 'error';
      }
    );
  }

  ngOnDestroy(): void {
    this.dataFetching.complete();
  }

  ngOnChanges(_changes: SimpleChanges): void {
    if (!this.itemData || !this.itemData.currentResult || !this.group) {
      this.state = 'error';
      return;
    }
    this.dialog = 'closed';
    this.dataFetching.next({
      groupId: this.group.id,
      itemId: this.itemData.item.id,
      attemptId: this.itemData.currentResult.attemptId,
      filter: this.currentFilter
    });
  }

  private getProgress(itemId: string, groupId: string, filter: TypeFilter): Observable<Progress[]> {
    switch (filter) {
      case 'Users':
        return this.getGroupUsersProgressService.getUsersProgress(groupId, [ itemId ]);
      case 'Teams':
        return this.getGroupUsersProgressService.getTeamsProgress(groupId, [ itemId ]);
      case 'Groups':
        return this.getGroupUsersProgressService.getGroupsProgress(groupId, [ itemId ])
          .pipe(map(groupsProgress => groupsProgress.map(m => ({
            groupId: m.groupId,
            itemId: m.itemId,
            validated: m.validationRate === 1,
            score: m.averageScore,
            timeSpent: m.avgTimeSpent,
          }))));
    }
  }

  private getRows(groupId: string, filter: TypeFilter): Observable<{id :string, value: string}[]> {
    switch (filter) {
      case 'Users':
        return this.getGroupDescendantsService.getUserDescendants(groupId)
          .pipe(map(users => users.map(user => ({ id: user.id, value: formatUser(user.user) }))));
      case 'Teams':
        return this.getGroupDescendantsService.getTeamDescendants(groupId)
          .pipe(map(teams => teams.map(team => ({ id: team.id, value: team.name }))));
      case 'Groups':
        return this.getGroupChildrenService.getGroupChildren(groupId, [], [], [ 'Team', 'User' ])
          .pipe(map(groups => groups.map(group => ({ id: group.id, value: group.name }))));
    }
  }

  private getData(itemId: string, groupId: string, attemptId: string, filter: TypeFilter): Observable<Data> {
    return forkJoin({
      items: this.getItemChildrenService.get(itemId, attemptId).pipe(map(items => items.map(item => ({
        id: item.id,
        title: item.string.title,
      })))),
      rows: this.getRows(groupId, filter),
      progress: this.getProgress(itemId, groupId, filter),
    }).pipe(
      map(data => ({
        type: filter,
        items: data.items,
        rows: data.rows.map(row => ({
          header: row.value,
          id: row.id,
          data: data.items.map(item =>
            data.progress.find(progress => progress.itemId === item.id && progress.groupId === row.id)
          ),
        })),
        can_access: (this.group?.current_user_can_grant_group_access
          && this.itemData?.item.permissions.can_grant_view !== 'none') || false,
      }))
    );
  }

  onFilterChange(typeFilter: TypeFilter): void {
    if (!this.itemData || !this.itemData.currentResult || !this.group) {
      this.state = 'error';
      return;
    }

    if (typeFilter !== this.currentFilter) {
      this.currentFilter = typeFilter;
      this.dataFetching.next({
        groupId: this.group.id,
        itemId: this.itemData.item.id,
        attemptId: this.itemData.currentResult.attemptId,
        filter: this.currentFilter
      });
    }
  }

  onAccess(title: string, _targetId: string, _itemId: string): void {
    this.dialogTitle = title;
    this.dialog = 'opened';

    // TODO LOAD PERMISSIONS
  }

  onDialogClose(_permissions: Permissions): void {
    this.dialog = 'closed';

    // TODO SAVE PERMISSIONS
  }
}