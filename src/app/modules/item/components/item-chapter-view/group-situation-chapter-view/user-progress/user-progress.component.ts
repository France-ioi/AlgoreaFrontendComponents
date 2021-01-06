import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { Group } from 'src/app/modules/group/http-services/get-group-by-id.service';
import { Item } from 'src/app/modules/item/http-services/get-item-by-id.service';
import { Permissions, PermissionsEditDialogComponent } from '../../../permissions-edit-dialog/permissions-edit-dialog.component';
import { Progress } from '../group-situation-chapter-view.component';

@Component({
  selector: 'alg-user-progress',
  templateUrl: './user-progress.component.html',
  styleUrls: [ './user-progress.component.scss' ]
})
export class UserProgressComponent implements OnChanges {

  @Input() title?: string;

  @Input() watchedGroup?: Group;
  @Input() item?: Item;
  @Input() userProgress?: Progress;

  state: 'success'|'in-progress'|'no-score'|'not-started' = 'no-score';

  @ViewChild(PermissionsEditDialogComponent) dialog!: PermissionsEditDialogComponent;

  canAccess = false;

  permissions: Permissions = {
    can_view: 'none',
    can_enter_from: true,
    can_grant_view: 'none',
    can_watch: 'none',
    can_edit: 'none',
    can_make_session_official: false,
    is_owner: true,
  };

  visibleDialog = false;

  ngOnChanges(_changes: SimpleChanges): void {
    if (!this.userProgress || !this.watchedGroup || !this.item) return;

    if (this.userProgress.validated || this.userProgress.score === 100) this.state = 'success';
    else if (this.userProgress.score > 0) this.state = 'in-progress';
    else if (this.userProgress.score === 0 && this.userProgress.timeSpent > 0) this.state = 'no-score';
    else this.state = 'not-started';

    this.canAccess = true;// this.watchedGroup.current_user_can_grant_group_access && this.item.permissions.can_grant_view !== 'none';
  }

  onClickAccess(): void {
    this.dialog.visible = true;
  }

  onDialogClose(_permissions: Permissions): void {
    this.dialog.visible = false;
    //NOTHING FOR NOW
  }
}
