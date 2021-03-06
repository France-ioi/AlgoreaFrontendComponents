import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { GroupShortInfo } from '../../http-services/get-group-by-id.service';

const MAX_ITEMS_DISPLAY = 4;

@Component({
  selector: 'alg-group-links',
  templateUrl: './group-links.component.html',
  styleUrls: [ './group-links.component.scss' ]
})
export class GroupLinksComponent {
  @Input() items?: GroupShortInfo[];

  maxItemsDisplay = MAX_ITEMS_DISPLAY;

  constructor(private router: Router) { }

  onButtonClick(item: GroupShortInfo): void {
    void this.router.navigate([ 'groups', 'by-id', item.id, 'details' ]);
  }

}
