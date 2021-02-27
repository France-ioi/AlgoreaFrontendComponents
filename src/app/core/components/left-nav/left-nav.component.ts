
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { map, pairwise } from 'rxjs/operators';
import {
  CurrentContentService,
  isActivityInfo,
  isGroupInfo,
  isItemInfo,
  isSkillInfo
} from 'src/app/shared/services/current-content.service';
import { GroupNavigationService } from '../../http-services/group-navigation.service';
import { ItemNavigationService } from '../../http-services/item-navigation.service';
import { LeftNavGroupDataSource } from './left-nav-group-datasource';
import { LeftNavActivityDataSource, LeftNavSkillDataSource } from './left-nav-item-datasource';

const activitiesTabIdx = 0;
const skillsTabIdx = 1;
const groupsTabIdx = 2;

@Component({
  selector: 'alg-left-nav',
  templateUrl: './left-nav.component.html',
  styleUrls: [ './left-nav.component.scss' ]
})
export class LeftNavComponent implements OnInit, OnDestroy {

  activeTabIndex = 0;
  readonly dataSources: [LeftNavActivityDataSource, LeftNavSkillDataSource, LeftNavGroupDataSource] = [
    new LeftNavActivityDataSource(this.itemNavigationService),
    new LeftNavSkillDataSource(this.itemNavigationService),
    new LeftNavGroupDataSource(this.groupNavigationService),
  ];

  private subscription?: Subscription;

  constructor(
    private currentContent: CurrentContentService,
    private itemNavigationService: ItemNavigationService,
    private groupNavigationService: GroupNavigationService,
  ) { }

  ngOnInit(): void {
    // Follow page change and trigger changes.
    this.subscription = this.currentContent.currentContent$.pipe(
      // we are only interested in items and groups
      map(content => (content !== null && (isItemInfo(content) || isGroupInfo(content)) ? content : undefined)),
      pairwise(),
    ).subscribe(([ prevContent, content ]) => {
      if (!prevContent && !content) return; // if was not an item/group and still not one, do nothing

      // If the content changed (different id), clear the selection (clear all tabs as we don't really know on which tab was the selection)
      if (prevContent?.route.id !== content?.route.id) this.dataSources.forEach(l => l.removeSelection());

      if (!content) return; // no tab and no content to select

      if (isGroupInfo(content)) {
        this.activeTabIndex = groupsTabIdx;
        this.dataSources[groupsTabIdx].showContent(content);

      } else if (isSkillInfo(content)) {
        this.activeTabIndex = skillsTabIdx;
        this.dataSources[skillsTabIdx].showContent(content);

      } else if (isActivityInfo(content)) {
        this.activeTabIndex = activitiesTabIdx;
        this.dataSources[activitiesTabIdx].showContent(content);

      } else { // item with an unknow type
        // as we do not know if it is an activity or skill, we cannot show content while we would like to select ids if already listed
        // TODO
      }

    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  onSelectionChangedByIdx(e: { index: number }): void {
    this.activeTabIndex = e.index;
    this.dataSources[e.index].focus();
  }

}
