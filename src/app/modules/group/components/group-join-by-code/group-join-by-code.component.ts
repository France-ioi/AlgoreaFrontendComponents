import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnChanges, SimpleChanges } from '@angular/core';
import { Duration } from '../../../../shared/helpers/duration';
import { Group } from '../../http-services/get-group-by-id.service';
import {
  codeExpiration,
  CodeLifetime,
  codeLifetime,
  durationBeforeCodeExpiration,
  durationSinceFirstCodeUse,
  hasCodeExpired,
  hasCodeInUse,
  hasCodeNotSet,
  hasCodeUnused,
  isSameCodeLifetime,
} from '../../helpers/group-code';
import { GroupActionsService } from '../../http-services/group-actions.service';
import { CodeActionsService } from '../../http-services/code-actions.service';
import { ActionFeedbackService } from 'src/app/shared/services/action-feedback.service';

interface GroupCodeInfo {
  hasCodeNotSet: boolean;
  hasCodeUnused: boolean;
  hasCodeInUse: boolean;
  hasCodeExpired: boolean;
  durationSinceFirstCodeUse?: Duration;
  durationBeforeCodeExpiration?: Duration;
  codeExpiration?: Date;
  codeLifetime?: CodeLifetime;
}

@Component({
  selector: 'alg-group-join-by-code',
  templateUrl: './group-join-by-code.component.html',
  styleUrls: [ './group-join-by-code.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class GroupJoinByCodeComponent implements OnChanges {

  @Input() group?: Group;
  @Output() refreshRequired = new EventEmitter<void>();

  groupCodeInfo?: GroupCodeInfo;
  initialCodeLifetimeDuration?: Duration;
  processing = false;

  constructor(
    private groupActionsService: GroupActionsService,
    private codeActionsService: CodeActionsService,
    private actionFeedbackService: ActionFeedbackService,
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.group && this.group) {
      this.groupCodeInfo = {
        hasCodeNotSet: hasCodeNotSet(this.group),
        hasCodeUnused: hasCodeUnused(this.group),
        hasCodeInUse: hasCodeInUse(this.group),
        hasCodeExpired: hasCodeExpired(this.group),
        durationSinceFirstCodeUse: durationSinceFirstCodeUse(this.group),
        durationBeforeCodeExpiration: durationBeforeCodeExpiration(this.group),
        codeExpiration: codeExpiration(this.group),
        codeLifetime: codeLifetime(this.group)
      };
      this.initialCodeLifetimeDuration = this.groupCodeInfo.codeLifetime instanceof Duration
        ? this.groupCodeInfo.codeLifetime
        : undefined;
    }
  }

  /* events */

  generateNewCode(): void {
    if (!this.group) return;

    // Disable UI
    this.processing = true;

    // call code refresh service, then group refresh data
    this.codeActionsService.createNewCode(this.group.id).subscribe({
      next: () => {
        this.actionFeedbackService.success($localize`A new code has been generated`);
        this.processing = false;
        this.refreshRequired.emit();
      },
      error: () => {
        this.actionFeedbackService.unexpectedError();
        this.processing = false;
      },
    });
  }

  submitCodeLifetime(newCodeLifetime: CodeLifetime): void {
    if (!this.group || !this.groupCodeInfo) return;
    if (this.groupCodeInfo.hasCodeNotSet || isSameCodeLifetime(this.groupCodeInfo.codeLifetime, newCodeLifetime)) return;

    // disable UI
    this.processing = true;

    // call code refresh service, then group refresh data
    this.groupActionsService.updateGroup(this.group.id, {
      code_lifetime: newCodeLifetime instanceof Duration ? newCodeLifetime.toString() : newCodeLifetime,
      code_expires_at: null,
    }).subscribe({
      next: () => {
        this.actionFeedbackService.success($localize`The validity has been changed`);
        this.processing = false;
        this.refreshRequired.emit();
      },
      error: () => {
        this.actionFeedbackService.unexpectedError();
        this.processing = false;
      },
    });
  }

  removeCode(): void {
    if (!this.group) return;

    // disable UI
    this.processing = true;

    // call code refresh service, then group refresh data
    this.codeActionsService.removeCode(this.group.id).subscribe({
      next: () => {
        this.actionFeedbackService.success($localize`Users will not be able to join with the former code.`);
        this.processing = false;
        this.refreshRequired.emit();
      },
      error: () => {
        this.actionFeedbackService.unexpectedError();
        this.processing = false;
      },
    });
  }

}
