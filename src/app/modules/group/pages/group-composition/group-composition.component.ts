import { Component, EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ActionFeedbackService } from 'src/app/shared/services/action-feedback.service';
import { TypeFilter } from '../../components/group-composition-filter/group-composition-filter.component';
import { MemberListComponent } from '../../components/member-list/member-list.component';
import { ManagementAdditions, withManagementAdditions } from '../../helpers/group-management';
import { Group } from '../../http-services/get-group-by-id.service';
import { GroupCreationService } from '../../http-services/group-creation.service';

export interface GroupChildData {
  id?: string,
  title: string,
  type: 'Class'|'Team'|'Club'|'Friends'|'Other',
}

@Component({
  selector: 'alg-group-composition',
  templateUrl: './group-composition.component.html',
  styleUrls: [ './group-composition.component.scss' ]
})
export class GroupCompositionComponent implements OnChanges {

  @Input() group?: Group;
  @Output() groupRefreshRequired = new EventEmitter<void>();
  groupWithPermissions?: Group & ManagementAdditions;

  @ViewChild('memberList') private memberList?: MemberListComponent;

  state: 'addingGroup' | 'ready' = 'ready';

  constructor(
    private groupCreationService: GroupCreationService,
    private actionFeedbackService: ActionFeedbackService,
  ) {}

  ngOnChanges(): void {
    this.groupWithPermissions = this.group ? withManagementAdditions(this.group) : undefined;
  }

  refreshGroupInfo(): void {
    this.groupRefreshRequired.emit();
  }

  addGroup(group: GroupChildData): void {
    if (!this.group) throw Error('Tried to add a subgroup to an undefined group');

    this.state = 'addingGroup';

    forkJoin({
      parentGroupId: of(this.group.id),
      childGroupId: group.id ? of(group.id) : this.groupCreationService.create(group.title, group.type),
    }).pipe(switchMap(ids => this.groupCreationService.addSubgroup(ids.parentGroupId, ids.childGroupId))).subscribe({
      next: _ => {
        this.actionFeedbackService.success($localize`Group successfully added as child group`);
        this.memberList?.setFilter({ directChildren: true, type: TypeFilter.Groups });
        this.state = 'ready';
      },
      error: _err => {
        this.actionFeedbackService.unexpectedError();
        this.state = 'ready';
      }
    });
  }

}
