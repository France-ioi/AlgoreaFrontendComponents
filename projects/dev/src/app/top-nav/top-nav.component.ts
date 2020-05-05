import { Component, OnInit, Output, EventEmitter, Input, HostListener } from '@angular/core';
import { StatusService } from '../shared/services/status.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.scss']
})
export class TopNavComponent implements OnInit {

  @Output() collapseEvent = new EventEmitter<boolean>();
  @Output() foldEvent = new EventEmitter<boolean>();
  @Output() signInOutEvent = new EventEmitter<boolean>();

  @Input() collapsed = false;
  @Input() templateId = 0;
  @Input() folded = false;

  @Input() data;

  showNotification = false;
  @Input() signedIn = true;

  @Output() onNotify = new EventEmitter<any>();
  @Output() onSearch = new EventEmitter<any>();
  @Output() onSearchClose = new EventEmitter<any>();

  langs = [
    'English',
    'Francais',
    'Espanol',
    'Czech',
    'Deutsch'
  ];

  constructor(
    private statusService: StatusService,
    private router: Router
  ) { }

  ngOnInit() {
  }

  onCollapse(e) {
    this.collapsed = !this.collapsed;
    this.collapseEvent.emit(this.collapsed);
    console.log(this.templateId);
  }

  onFold(e) {
    this.folded = !this.folded;
    this.foldEvent.emit(this.folded);
  }

  toggleNotification(e) {
    this.showNotification = !this.showNotification;
    this.statusService.setUrl(this.router.url);
    this.onNotify.emit(e);
  }

  signInOut(e) {
    this.signedIn = !this.signedIn;
    this.signInOutEvent.emit(this.signedIn);
    console.log(this.signedIn, this.templateId);
  }

  onSearchEvent(e) {
    this.onSearch.emit(e);
  }

  onSearchCloseEvent(e) {
    this.onSearchClose.emit(e);
  }

}
