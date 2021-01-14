import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Group } from 'src/app/core/components/group-nav-tree/group';
import { AddedContent, NewContentType } from 'src/app/modules/shared-components/components/add-content/add-content.component';
import { SearchGroupService } from '../../http-services/search-group.service';

type GroupType = 'Class'|'Team'|'Club'|'Friends'|'Other';

@Component({
  selector: 'alg-add-sub-group',
  templateUrl: './add-sub-group.component.html',
  styleUrls: [ './add-sub-group.component.scss' ]
})
export class AddSubGroupComponent {

  @Input() group?: Group;

  @Output() addGroup = new EventEmitter<AddedContent<GroupType>>();

  groupsFound: {
    type: GroupType,
    title: string,
    description: string|null,
  }[] = [];

  allowedNewGroupTypes: NewContentType<GroupType>[] = [
    {
      type: 'Class',
      icon: 'fa fa-book',
      title: $localize`Class`,
      description: $localize`Class`,
    },
    {
      type: 'Club',
      icon: 'fa fa-book',
      title: $localize`Club`,
      description: $localize`Club`,
    },
    {
      type: 'Friends',
      icon: 'fa fa-users',
      title: $localize`Friends`,
      description: $localize`Friends`,
    },
    {
      type: 'Other',
      icon: 'fa fa-book',
      title: $localize`Other`,
      description: $localize`Other`,
    },
  ];

  searchFunction = (value: string): Observable<AddedContent<GroupType>[]> =>
    this.searchGroupService.search(value).pipe(map(groups => groups.map(group => ({
      type: group.type,
      title: group.name,
      description: group.description,
    }))));

  constructor(
    private searchGroupService: SearchGroupService,
  ) {}

  addChild(group: AddedContent<GroupType>): void {
    this.addGroup.emit(group);
  }
}
