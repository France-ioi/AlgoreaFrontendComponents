import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from "@angular/material";

@Component({
  selector: "app-attach-group-dialog",
  templateUrl: "./attach-group-dialog.component.html",
  styleUrls: ["./attach-group-dialog.component.scss"],
})
export class AttachGroupDialogComponent implements OnInit {
  trees;

  constructor(
    public dialogRef: MatDialogRef<AttachGroupDialogComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data
  ) {}

  ngOnInit() {}

  onClose(e) {
    this.dialogRef.close(e);
  }
}
