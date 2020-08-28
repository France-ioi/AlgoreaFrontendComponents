/* eslint-disable */ /* FIXME disabled for now while this is the mockup code, to be removed afterwards */
import { Component, HostListener, OnInit } from '@angular/core';
import { ProgressType } from '../modules/shared-components/components/skill-progress/skill-progress.component';
import { Router } from '@angular/router';
import { StatusService } from '../shared/services/status.service';

@Component({
  selector: 'alg-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  ProgressType = ProgressType;
  title = 'dev';
  editing = false;
  curScore = 70;
  dispScore = 65;
  isStarted = true;

  langs = [
    'English',
    'Francais',
    'Espanol',
    'Czech',
    'Deutsch'
  ];

  // Tree Data

  files;
  groups;
  trees;

  allowFullScreen = false;

  breaddata = {
    selectedID: 42,
    path: [
      { ID: 1, label: 'Contest', separator: 'slash' },
      {
        ID: 42,
        label: 'Personalized contest',
        attempt: 12,
        separator: 'arrow'
      },
      { ID: 43, label: 'Personalized contests', attempt: 12 },
      { ID: 23, label: 'IOI Selection 2012', attempt: 2 },
      { ID: 24, label: 'Individuals', separator: 'slash' }
    ]
  };

  breadhome = {
    selectedID: -1,
    path: [
      { ID: 1, label: 'Home' }
    ]
  };

  user = {
    name: 'Concours castor',
    notification: 2,
    image: '_messi.jpg'
  };

  collapsed = false;
  folded = false;
  scrolled = false;
  signedIn = true;
  notified = false;
  activityORSkill = true;

  taskdata;
  selectedType = -1;
  userTitle;

  constructor(
    private statusService: StatusService,
    private router: Router
  ) {}

  ngOnInit() {
    this.statusService.setUser({
      title: 'Lionel MESSI',
      avatar: '_messi.jpg',
      type: 'user'
    });
    this.statusService.getObservable().subscribe(res => {
      this.scrolled = res.scrolled;
      this.folded = res.folded;
      this.isStarted = res.isStarted;
      this.collapsed = res.collapsed;
      this.activityORSkill = res.activityORSkill;
      this.editing = res.editing;
      this.notified = res.notified;
      this.userTitle = res.userTitle;
    });
  }

  updateService() {
    this.statusService.setValue({
      scrolled: this.scrolled,
      folded: this.folded,
      isStarted: this.isStarted,
      collapsed: this.collapsed,
      activityORSkill: this.activityORSkill,
      editing: this.editing,
      notified: this.notified,
      userTitle: this.userTitle
    });
  }

  onCollapse(e) {
    this.collapsed = e;
    if (!this.collapsed) {
      this.folded = false;
    }
    this.updateService();
  }

  onFold(e) {
    this.folded = e;
  }

  onDisplayScoreChange(e) {
    this.dispScore = e.srcElement.valueAsNumber;
  }

  onCurrentScoreChange(e) {
    this.curScore = e.srcElement.valueAsNumber;
  }

  onIsStartedChange(e) {
    this.isStarted = e.srcElement.checked;
  }

  @HostListener('window:scroll', ['$event'])
  onScrollContent(_e) {
    if (window.pageYOffset > 40 && !this.scrolled) {
      this.scrolled = true;
    } else if (window.pageYOffset <= 40 && this.scrolled) {
      this.scrolled = false;
    }
  }

  onJoinGroupSelected(_e) {
    this.selectedType = 3;
    this.userTitle = 'Groups you joined';
    this.updateService();
    this.router.navigate(['/groups/memberships']);
  }

  onManageGroupSelected(_e) {
    this.selectedType = 3;
    this.userTitle = 'Groups you manage';
    this.updateService();
    this.router.navigate(['/groups']);
  }

  onGroupSelected(e) {
    this.selectedType = 1;
    this.userTitle = 'Jean Monet';
    this.updateService();
    if (e.src === 'managed') {
      this.router.navigate([`/groups/details/${e.e.ID}`]);
    } else {
      this.router.navigate(['/groups/details/11']);
    }
  }

  onEditPage(_e) {
    this.editing = true;
    this.updateService();
  }

  onEditCancel(_e) {
    this.editing = false;
    this.updateService();
  }

  onNotify(_e) {

  }

  onSignInOut(_e) {

  }

  onSkillSelected(_e) {

  }

  onActivitySelected(_e) {

  }

  onYourselfSelected(_e) {

  }
}
