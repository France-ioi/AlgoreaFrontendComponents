import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProgressSectionValue } from 'src/app/modules/shared-components/components/progress-section/progress-section.component';

interface Section {
  header: {
    title: string,
    icon: string,
  },
  field: string,
  disabled?: boolean,

  label?: string,
  defaultBooleanValue?: boolean,

  values?: ProgressSectionValue<string>[]
  defaultValue?: string,
}

export interface AccessEdit {
  title: string,
  comment: string,
  sections: Section[],
}

@Component({
  selector: 'alg-access-edit-dialog',
  templateUrl: './access-edit-dialog.component.html',
  styleUrls: [ './access-edit-dialog.component.scss' ]
})
export class AccessEditDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<AccessEditDialogComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: AccessEdit,
  ) { }

  ngOnInit(): void {
  }

  onClose(): void {
    this.dialogRef.close('test');
  }
}
