import { Component, OnInit } from '@angular/core';
import { Group } from '../../../shared/models/group.model';
import { GroupService } from '../../../shared/services/api/group.service';

@Component({
  selector: 'app-group-settings',
  templateUrl: './group-settings.component.html',
  styleUrls: ['./group-settings.component.scss']
})
export class GroupSettingsComponent implements OnInit {
  group: Group = new Group();

  constructor(
    private groupService: GroupService
  ) { }

  ngOnInit() {
    this.groupService.getLatestGroup().subscribe(group => {
      this.group = group;
    });
  }

}
