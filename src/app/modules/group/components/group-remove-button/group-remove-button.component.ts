import { Component, Input, OnChanges } from '@angular/core';
import { Group } from '../../http-services/get-group-by-id.service';
import { distinct, switchMap, map } from 'rxjs/operators';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { GetGroupChildrenService, GroupChild } from '../../http-services/get-group-children.service';
import { ConfirmationService } from 'primeng/api';
import { ActionFeedbackService } from '../../../../shared/services/action-feedback.service';
import { GroupDeleteService } from '../../services/group-delete.service';
import { Router } from '@angular/router';
import { mapToFetchState } from '../../../../shared/operators/state';

@Component({
  selector: 'alg-group-remove-button',
  templateUrl: './group-remove-button.component.html',
  styleUrls: [ './group-remove-button.component.scss' ]
})
export class GroupRemoveButtonComponent implements OnChanges {
  @Input() group?: Group;

  deletionInProgress$ = new Subject<boolean>();

  private readonly id$ = new ReplaySubject<string>(1);
  readonly state$ = this.id$.pipe(
    distinct(),
    switchMap(id => this.hasGroupChildren$(id)),
    mapToFetchState(),
  );

  constructor(
    private actionFeedbackService: ActionFeedbackService,
    private confirmationService: ConfirmationService,
    private getGroupChildrenService: GetGroupChildrenService,
    private groupDeleteService: GroupDeleteService,
    private router: Router,
  ) { }

  ngOnChanges(): void {
    if (this.group) {
      this.id$.next(this.group.id);
    }
  }

  hasGroupChildren$(groupId: string): Observable<boolean> {
    return this.getGroupChildrenService.getGroupChildren(groupId).pipe(
      map((groupChild: GroupChild[]) => groupChild.length > 0)
    );
  }

  onDeleteGroup(): void {
    if (!this.group) {
      return;
    }

    this.confirmationService.confirm({
      message: $localize`Are you sure you want to delete the group "${ this.group.name }"`,
      header: $localize`Confirm Action`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: $localize`Delete it`,
      accept: () => {
        this.deleteGroup();
      },
      rejectLabel: $localize`No`,
    });
  }

  deleteGroup(): void {
    if (!this.group) {
      return;
    }

    const id = this.group.id;
    const groupName = this.group.name;

    this.deletionInProgress$.next(true);
    this.groupDeleteService.delete(id)
      .subscribe({
        next: () => {
          this.deletionInProgress$.next(false);
          this.actionFeedbackService.success($localize`You have delete "${groupName}"`);
          this.navigateToMyGroups();
        },
        error: _err => {
          this.deletionInProgress$.next(false);
          this.actionFeedbackService.error($localize`Failed to delete "${groupName}"`);
        }
      });
  }

  navigateToMyGroups(): void {
    void this.router.navigate([ '/groups/mine' ]);
  }

}
