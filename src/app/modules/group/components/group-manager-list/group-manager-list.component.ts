import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Group } from '../../http-services/get-group-by-id.service';
import { GetGroupManagersService, Manager } from '../../http-services/get-group-managers.service';
import { Router } from '@angular/router';

@Component({
  selector: 'alg-group-manager-list',
  templateUrl: './group-manager-list.component.html',
  styleUrls: [ './group-manager-list.component.scss' ]
})
export class GroupManagerListComponent implements OnChanges {

  @Input() group?: Group;

  managers: (Manager&{can_manage_as_text: string})[] = [];

  state: 'loading' | 'ready' | 'error' = 'loading';

  constructor(private getGroupManagersService: GetGroupManagersService, private router: Router) {}


  ngOnChanges(_changes: SimpleChanges): void {
    this.reloadData();
  }

  private getManagerLevel(manager: Manager): string {
    switch (manager.can_manage) {
      case 'none':
        return $localize`Read-only`;
      case 'memberships':
        return $localize`Memberships`;
      case 'memberships_and_group':
        return $localize`Memberships and group`;
    }
  }

  private reloadData(): void {
    if (!this.group) return;
    this.state = 'loading';
    this.getGroupManagersService
      .getGroupManagers(this.group.id)
      .subscribe(
        (managers: Manager[]) => {
          this.managers = managers.map(manager => ({ ...manager, can_manage_as_text: this.getManagerLevel(manager) }));
          this.state = 'ready';
        },
        _err => {
          this.state = 'error';
        }
      );
  }

  onClick(manager: Manager): void {
    void this.router.navigate([ '/', 'groups', 'users', manager.id ]);
  }
}
