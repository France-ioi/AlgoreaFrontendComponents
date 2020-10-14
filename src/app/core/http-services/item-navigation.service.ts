import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { bestAttemptFromResults, Result } from 'src/app/shared/helpers/attempts';
import { canCurrentUserViewItemContent } from 'src/app/modules/item/helpers/item-permissions';

interface ItemStrings {
  title: string,
  language_tag: string,
}

interface ActivityOrSkill {
  id: string,
  string: ItemStrings,
  type: ItemType,
  best_score: number,
  no_score: boolean,
  has_visible_children: boolean,
  permissions: {
    can_view: 'none'|'info'|'content'|'content_with_descendants'|'solution'
  },
  results: {
    attempt_id: string,
    latest_activity_at: string|null,
    started_at: string|null,
    score_computed: number,
    validated: number,
}[]
}

interface RootActivity {
  // Some attributes are omitted as they are not used for the moment. Read the doc for the full list.
  group_id: string,
  name: string,
  activity: ActivityOrSkill
}

interface RootSkill {
  group_id: string,
  name: string,
  skill: ActivityOrSkill
}

interface RawNavData {
  id: string,
  attempt_id: string,
  string: ItemStrings,
  type: ItemType,
  children: {
    id: string,
    string: ItemStrings,
    type: ItemType,
    best_score: number,
    no_score: boolean,
    has_visible_children: boolean,
    permissions: {
      can_view: 'none'|'info'|'content'|'content_with_descendants'|'solution'
    },
    results: {
      attempt_id: string,
      latest_activity_at: string|null,
      started_at: string|null,
      score_computed: number,
      validated: number,
    }[],
  }[]
}

export type ItemType = 'Chapter'|'Task'|'Course'|'Skill';

// exported nav menu structure
export interface NavMenuItem {
  id: string,
  title: string,
  hasChildren: boolean,
  groupName?: string,
  attemptId: string|null,
  score?: { best: number, current: number },
  canViewContent: boolean,
  children?: NavMenuItem[] // placeholder for children when fetched (may 'hasChildren' with 'children' not set)
}

export interface NavMenuRootItem {
  parent?: NavMenuItem,
  items: NavMenuItem[]
}

function createNavMenuItem(raw: {
  id: string,
  string: ItemStrings,
  has_visible_children: boolean,
  results?: Result[],
  no_score: boolean,
  best_score: number,
  permissions: {
    can_view: 'none'|'info'|'content'|'content_with_descendants'|'solution'
  },
}): NavMenuItem {
  const currentResult = raw.results ? bestAttemptFromResults(raw.results) : undefined;
  return {
    id: raw.id,
    title: raw.string.title,
    hasChildren: raw.has_visible_children,
    attemptId: currentResult?.attempt_id || null,
    canViewContent: canCurrentUserViewItemContent(raw),
    score: raw.no_score || !currentResult ? undefined : { best: raw.best_score, current: currentResult.score_computed }
  };
}

@Injectable({
  providedIn: 'root'
})
export class ItemNavigationService {

  constructor(private http: HttpClient) {}

  getNavData(itemId: string, attemptId: string): Observable<NavMenuRootItem> {
    return this.getNavDataGeneric(itemId, { attempt_id: attemptId});
  }

  getNavDataFromChildAttempt(itemId: string, childAttemptId: string): Observable<NavMenuRootItem> {
    return this.getNavDataGeneric(itemId, { child_attempt_id: childAttemptId});
  }

  private getNavDataGeneric(itemId: string, parameters: {[param: string]: string}): Observable<NavMenuRootItem> {
    return this.http
      .get<RawNavData>(`${environment.apiUrl}/items/${itemId}/navigation`, {
        params: parameters
      })
      .pipe(
        map<RawNavData,NavMenuRootItem>((data: RawNavData): NavMenuRootItem => ({
          parent: {
            id: data.id,
            title: data.string.title,
            canViewContent: true,
            hasChildren: data.children !== null && data.children.length > 0,
            attemptId: data.attempt_id,
          },
          items: data.children === null ? [] : data.children.map(i => createNavMenuItem(i)),
        }))
      );
  }

  getRootActivities(): Observable<NavMenuRootItem> {
    return this.http
      .get<RootActivity[]>(`${environment.apiUrl}/current-user/group-memberships/activities`)
      .pipe(
        map(acts => ({
          items: acts.map(act => ({...createNavMenuItem(act.activity), groupName: act.name}))
        }))
      );
  }

  getRootSkills(): Observable<NavMenuRootItem> {
    return this.http
      .get<RootSkill[]>(`${environment.apiUrl}/current-user/group-memberships/skills`)
      .pipe(
        map(skills => ({
          items: skills.map(sk => ({...createNavMenuItem(sk.skill), groupName: sk.name}))
        }))
      );
  }

  getRoot(type: 'activity'|'skill'): Observable<NavMenuRootItem> {
    if (type === 'activity') return this.getRootActivities();
    else return this.getRootSkills();
  }

}
