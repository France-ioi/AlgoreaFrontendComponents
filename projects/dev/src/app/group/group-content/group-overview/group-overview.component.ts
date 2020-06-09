import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-group-overview',
  templateUrl: './group-overview.component.html',
  styleUrls: ['./group-overview.component.scss']
})
export class GroupOverviewComponent implements OnInit {

  @Input() id;
  @Input() description;

  tasks = [];

  columns = [
    { field: 'task', header: 'Task' },
    { field: 'chapter', header: 'Chapter' },
    { field: 'grade', header: 'Grade' },
    { field: 'date', header: 'Date' }
  ];

  panels = [
  ];

  constructor() { }

  ngOnInit() {
    this.panels.push(
      {
        name: 'Group',
        columns: this.columns
      }
    );

  }

  onExpandWidth(_e) {

  }

}
