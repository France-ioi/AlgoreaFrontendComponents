import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Group } from 'src/app/modules/group/http-services/get-group-by-id.service';
import { Item } from 'src/app/modules/item/http-services/get-item-by-id.service';
import { AccessEditDialogComponent } from '../../../access-edit-dialog/access-edit-dialog.component';
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

  canAccess = false;

  constructor(
    private dialog: MatDialog,
  ) { }

  ngOnChanges(_changes: SimpleChanges): void {
    if (!this.userProgress || !this.watchedGroup || !this.item) return;

    if (this.userProgress.validated || this.userProgress.score === 100) this.state = 'success';
    else if (this.userProgress.score > 0) this.state = 'in-progress';
    else if (this.userProgress.score === 0 && this.userProgress.timeSpent > 0) this.state = 'no-score';
    else this.state = 'not-started';

    this.canAccess = true;//this.group.current_user_can_grant_group_access && this.item.permissions.can_grant_view !== 'none';
  }

  onClickAccess(): void {
    const ref = this.dialog.open(AccessEditDialogComponent, {
      maxHeight: '83rem',
      minWidth: '67rem',
      maxWidth: '67rem',
      minHeight: '25rem',
      data: {
        title: this.title,
        comment: 'Comment',
        sections: [{
          header: {
            icon: 'fa fa-eye',
            title: 'Can view'
          },
          field: 'can_view',
          defaultValue: 'content',
          values: [
            {
              value: 'none',
              label: 'Nothing',
              comment: 'Item is invisible to the user'
            },
            {
              value: 'info',
              label: 'Info',
              comment: 'User(s) can see the item title and description, but not its content'
            },
            {
              value: 'content',
              label: 'Content',
              comment: 'User(s) can see the content of this item'
            },
            {
              value: 'content_with_descendants',
              label: 'Content and descendants',
              comment: 'User(s) can also see the content of this items descendants (when possible for this group)'
            },
            {
              value: 'solution',
              label: 'Solution',
              comment: 'User(s) can also see the solution of this items and its descendants (when possible for this group)'
            }
          ],
        },
        {
          header: {
            icon: 'fa fa-door-open',
            title: 'Can enter'
          },
          field: 'can_enter_from',
          label: 'User(s) may enter this item (a contest or time-limited chapter)',
          defaultBooleanValue: false,
        },
        {
          header: {
            icon: 'fa fa-key',
            title: 'Can grant view'
          },
          field: 'can_grant_view',
          defaultValue: 'content',
          values: [
            {
              value: 'none',
              label: 'Nothing',
              comment: 'User(s) can\'t grant any access to this item'
            },
            {
              value: 'enter',
              label: 'Info & enter',
              comment: 'User(s) can grant "Can view: info" and  "Can enter" access'
            },
            {
              value: 'content',
              label: 'Content',
              comment: 'User(s) can also grant "Can view: content" access'
            },
            {
              value: 'content_with_descendants',
              label: 'Content and descendants',
              comment: 'User(s) can also grant "Can view: content and descendants" access'
            },
            {
              value: 'solution',
              label: 'Solution',
              comment: 'User(s) can also grant "Can view: solution" access',
              disabled: true
            },
            {
              value: 'solution_with_grant',
              label: 'Solution and grant',
              comment: 'User(s) can also grant "Can grant view" access',
              disabled: true
            }
          ],
        },
        {
          header: {
            icon: 'fa fa-binoculars',
            title: 'Can watch'
          },
          field: 'can_watch',
          defaultValue: 'answer',
          values: [
            {
              value: 'none',
              label: 'Nothing',
              comment: 'User(s) can\'t watch the activity of others on this item'
            },
            {
              value: 'result',
              label: 'Result',
              comment: 'User(s) can view information about submissions and scores of others on this item, but not their answers'
            },
            {
              value: 'answer',
              label: 'Answer',
              comment: 'User(s) can also look at other people\'s answers on this item'
            },
            {
              value: 'answer_with_grant',
              label: 'Answer and grant',
              comment: 'User(s) can also grant "Can watch" access to others'
            }
          ],
        },
        {
          header: {
            icon: 'fa fa-pencil-alt',
            title: 'Can edit'
          },
          field: 'can_edit',
          defaultValue: 'all',
          values: [
            {
              value: 'none',
              label: 'Nothing',
              comment: 'User(s) can\'t make any changes to this item'
            },
            {
              value: 'children',
              label: 'Children',
              comment: 'User(s) can add children to this item and edit how permissions propagate to them'
            },
            {
              value: 'all',
              label: 'All',
              comment: 'User(s) can also edit the content of the item itself, but may not delete it'
            },
            {
              value: 'all_with_grant',
              label: 'All and grant',
              comment: 'User(s) can also give "Can edit" access to others'
            }
          ],
        },
        {
          header: {
            icon: 'fa fa-paperclip',
            title: 'Can attach official sessions'
          },
          field: 'can_make_session_official',
          defaultBooleanValue: false,
          label: 'User(s) may attach official sessions to this item, that will be visible to everyone in the content tab of the item',
        },
        {
          header: {
            icon: 'fa fa-user-tie',
            title: 'Is owner'
          },
          field: 'is_owner',
          defaultBooleanValue: false,
          label:
          'User(s) own this item, and get the maximum access in all categories above, and may also delete this item',
        }]
      }
    });
    ref.afterClosed().subscribe(result => {
      console.log('closed', result);
    });
  }
}
