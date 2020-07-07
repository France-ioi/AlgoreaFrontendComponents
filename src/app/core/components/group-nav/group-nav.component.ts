import { Component, Output, EventEmitter } from '@angular/core';
import { GetJoinedGroupsService, Group } from '../../http-services/get-joined-groups.service';

const joinGroupTabIdx = 0;

@Component({
  selector: 'alg-group-nav',
  templateUrl: './group-nav.component.html',
  styleUrls: ['./group-nav.component.scss']
})
export class GroupNavComponent {

  @Output() focusOnGroupNav = new EventEmitter<void>();

  joinedGroupLoading = true;
  joinedGroups: Group[] = [];

  constructor(
    private getJoinedGroupsService: GetJoinedGroupsService,
  ) { }

  onTabOpen(event: {index: number}) {
    this.focusOnGroupNav.emit();
    if (event.index == joinGroupTabIdx) {
      this.joinedGroupLoading = true;
      this.getJoinedGroupsService
        .getJoinedGroup()
        .subscribe((g) => {
          this.joinedGroups = g;
          this.joinedGroupLoading = false;
        });
    }
  }

}
