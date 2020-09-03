import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import * as _ from 'lodash-es';

export interface Group {
  id: string,
  name: string
}

interface ManagedGroup{
  id: string,
  name: string
}

@Injectable({
  providedIn: 'root'
})
export class ManagedGroupsService {

  constructor(private http: HttpClient) {}

  getManagedGroups(): Observable<Group[]> {
    return this.http
      .get<ManagedGroup[]>(`${environment.apiUrl}/current-user/managed-groups`)
      .pipe(
        // convert array of ManagedGroup to array of Group (exported type)
        map((gs) =>
          _.map(gs, (g) => {
            return { id: g.id, name: g.name };
          })
        )
      );
  }

}


