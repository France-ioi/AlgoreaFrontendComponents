import { Component, HostListener, OnInit } from '@angular/core';
import { CurrentUserService } from '../shared/services/current-user.service';
import { delay, filter, skip } from 'rxjs/operators';
import { UserProfile } from '../shared/http-services/current-user.service';
import { Observable } from 'rxjs';
import { ContentInfo, CurrentContentService } from '../shared/services/current-content.service';

@Component({
  selector: 'alg-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  // the delay(0) is used to prevent the UI to update itself (when the content is loaded) (ExpressionChangedAfterItHasBeenCheckedError)
  currentContent$: Observable<ContentInfo|null>  = this.currentContent.currentContent$.pipe( delay(0) );

  editing = false;
  isStarted = true;

  langs = [
    'English',
    'Francais',
    'Espanol',
    'Czech',
    'Deutsch'
  ];

  collapsed = false;
  folded = false;
  scrolled = false;

  selectedType = -1;

  constructor(
    private currentUserService: CurrentUserService,
    private currentContent: CurrentContentService,
  ) {}

  ngOnInit() {
   // each time there is a new user, refresh the page
    this.currentUserService.currentUser().pipe(
      filter<UserProfile|null, UserProfile>((user):user is UserProfile => user !== null),
      skip(1), // do not refresh when the first user is set
    ).subscribe(_user => {
      window.location.reload();
    });
  }

  onCollapse(e: boolean) {
    this.collapsed = e;
    if (!this.collapsed) {
      this.folded = false;
    }
  }

  onFold(folded: boolean) {
    this.folded = folded;
  }

  @HostListener('window:scroll', ['$event'])
  onScrollContent() {
    if (window.pageYOffset > 40 && !this.scrolled) {
      this.scrolled = true;
    } else if (window.pageYOffset <= 40 && this.scrolled) {
      this.scrolled = false;
    }
  }

  onEditPage() {
    this.editing = true;
  }

  onEditCancel() {
    this.editing = false;
  }

}
