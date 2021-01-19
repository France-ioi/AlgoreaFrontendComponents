import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { MessageService } from 'primeng/api';
import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ERROR_MESSAGE } from 'src/app/shared/constants/api';
import { TOAST_LENGTH } from 'src/app/shared/constants/global';
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
  groupWithPermissions?: Group & ManagementAdditions

  constructor(
    private groupCreationService: GroupCreationService,
    private messageService: MessageService,
  ) {}

  ngOnChanges(): void {
    this.groupWithPermissions = this.group ? withManagementAdditions(this.group) : undefined;
  }

  refreshGroupInfo(): void {
    this.groupRefreshRequired.emit();
  }

  addGroup(group: GroupChildData): void {
    if (!this.group) throw Error('Tried to add a subgroup to an undefined group');

    forkJoin({
      parentGroupId: of(this.group.id),
      childGroupId: group.id ? of(group.id) : this.groupCreationService.create(group.title, group.type),
    }).pipe(switchMap(ids => this.groupCreationService.addSubgroup(ids.parentGroupId, ids.childGroupId))).subscribe(
      _ => {
        this.displaySuccess($localize`Group successfully added as child group`);
        this.refreshGroupInfo();
      },
      _err => {
        this.displayError();
      }
    );
  }

  displaySuccess(msg: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: msg,
      life: TOAST_LENGTH,
    });
  }

  displayError(): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: ERROR_MESSAGE.fail,
      life: TOAST_LENGTH,
    });
  }

}
