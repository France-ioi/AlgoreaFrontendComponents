import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { assertSuccess, SimpleActionResponse } from '../../../shared/http-services/action-response';
import { appConfig } from '../../../shared/helpers/config';
import { map } from 'rxjs/operators';

export interface ItemChild {
  item_id: string,
  order: number,
}

export interface ItemChanges {
  children?: ItemChild[]
}

@Injectable({
  providedIn: 'root',
})
export class UpdateItemService {

  constructor(private http: HttpClient) {
  }

  updateItem(
    itemId: string,
    changes: ItemChanges,
  ): Observable<void> {
    return this.http.put<SimpleActionResponse>(
      `${appConfig().apiUrl}/items/${itemId}`,
      changes,
      { headers: { timeout: '10000' } },
    ).pipe(
      map(assertSuccess),
    );
  }
}