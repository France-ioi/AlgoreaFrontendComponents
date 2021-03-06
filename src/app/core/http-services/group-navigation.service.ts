import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { appConfig } from 'src/app/shared/helpers/config';

interface RawRootGroups {
  id: string,
  name: string,
  type: 'Class' | 'Team' | 'Club' | 'Friends' | 'Other' | 'User' | 'Session' | 'Base',
  current_user_managership: 'none' | 'direct' | 'ancestor' | 'descendant',
  current_user_membership: 'none' | 'direct' | 'descendant',
}

interface RawNavData {
  id: string,
  name: string,
  type: 'Class' | 'Team' | 'Club' | 'Friends' | 'Other' | 'User' | 'Session' | 'Base',
  children: {
    id: string,
    name: string,
    type: 'Class' | 'Team' | 'Club' | 'Friends' | 'Other' | 'User' | 'Session' | 'Base',
    current_user_managership: 'none' | 'direct' | 'ancestor' | 'descendant',
    current_user_membership: 'none' | 'direct' | 'descendant',
  }[]
}

// exported nav menu structure
export interface NavMenuGroup {
  id: string,
  title: string, // to implement NavTreeElement
  type: 'Class' | 'Team' | 'Club' | 'Friends' | 'Other' | 'User' | 'Session' | 'Base',
  hasChildren: boolean,
  children?: NavMenuGroup[] // placeholder for children when fetched (may 'hasChildren' with 'children' not set)
  currentUserManagership?: 'none' | 'direct' | 'ancestor' | 'descendant',
  currentUserMembership?: 'none' | 'direct' | 'descendant',
}

export interface NavMenuRootGroup {
  parent?: NavMenuGroup,
  groups: NavMenuGroup[]
}

export interface NavMenuRootGroupWithParent extends NavMenuRootGroup {
  parent: NavMenuGroup,
}

@Injectable({
  providedIn: 'root'
})
export class GroupNavigationService {

  constructor(private http: HttpClient) {}

  getNavData(groupId: string): Observable<NavMenuRootGroupWithParent> {
    return this.http
      .get<RawNavData>(`${appConfig.apiUrl}/groups/${groupId}/navigation`)
      .pipe(
        map((data: RawNavData) => ({
          parent: {
            id: data.id,
            title: data.name,
            type: data.type,
            hasChildren: data.children.length > 0,
          },
          groups: data.children.map(child => ({
            id: child.id,
            title: child.name,
            type: child.type,
            currentUserManagership: child.current_user_managership,
            currentUserMembership: child.current_user_membership,
            hasChildren: child.type !== 'User', // maybe should be fetched from backend
          })),
        }))
      );
  }

  getRoot(): Observable<NavMenuRootGroup> {
    return this.http
      .get<RawRootGroups[]>(`${appConfig.apiUrl}/groups/roots`)
      .pipe(
        map(g => ({
          groups: g.map(group => ({
            id: group.id,
            title: group.name,
            type: group.type,
            currentUserManagership: group.current_user_managership,
            currentUserMembership: group.current_user_membership,
            hasChildren: group.type !== 'User', // maybe should be fetched from backend (?)
          }))
        }))
      );
  }

}
