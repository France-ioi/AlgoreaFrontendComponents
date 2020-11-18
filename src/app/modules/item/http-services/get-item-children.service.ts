import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { appConfig } from 'src/app/shared/helpers/config';
import { ItemType } from 'src/app/shared/helpers/item-type';
import { ItemPermissionsInfo } from '../helpers/item-permissions';

interface RawItemChild extends ItemPermissionsInfo {
  id: string,
  best_score: number,
  order: number,
  string: {
    title: string|null,
  },
  category: 'Undefined'|'Discovery'|'Application'|'Validation'|'Challenge',
  type: ItemType,
  results: {
    attempt_id: string,
    latest_activity_at: string,
    started_at: string|null,
    score_computed: number,
    validated: boolean,
  }[],
}

export interface ItemChild extends ItemPermissionsInfo {
  id: string,
  bestScore: number,
  order: number,
  string: {
    title: string|null,
  },
  category: 'Undefined'|'Discovery'|'Application'|'Validation'|'Challenge',
  type: ItemType,
  results: {
    attempt_id: string,
    latestActivityAt: Date,
    startedAt: Date|null,
    score: number,
    validated: boolean,
  }[],
}


@Injectable({
  providedIn: 'root'
})
export class GetItemChildrenService {

  constructor(private http: HttpClient) { }

  get(id: string, attemptId: string): Observable<ItemChild[]> {
    let params = new HttpParams();
    params = params.set('attempt_id', attemptId);
    return this.http
      .get<RawItemChild[]>(`${appConfig().apiUrl}/items/${id}/children`, { params: params })
      .pipe(
        map(children => children.map(c => ({
          id: c.id,
          bestScore: c.best_score,
          order: c.order,
          string: c.string,
          category: c.category,
          type: c.type,
          results: c.results.map(r => ({
            attempt_id: r.attempt_id,
            latestActivityAt: new Date(r.latest_activity_at),
            startedAt: r.started_at === null ? null : new Date(r.started_at),
            score: r.score_computed,
            validated: r.validated,
          })),
          permissions: c.permissions,
        })))
      );
  }
}
