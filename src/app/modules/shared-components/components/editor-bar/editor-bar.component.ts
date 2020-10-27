import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'alg-editor-bar',
  templateUrl: './editor-bar.component.html',
  styleUrls: [ './editor-bar.component.scss' ],
})
export class EditorBarComponent implements OnInit {
  @Output() cancel = new EventEmitter();
  @Output() save = new EventEmitter();
  @Output() reload = new EventEmitter();

  constructor() {}

  ngOnInit() {}

  onCancelClick() {
    this.cancel.emit();
  }

  onValidateClick() {
    this.save.emit();
  }

}
