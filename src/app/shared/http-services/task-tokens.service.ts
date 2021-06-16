import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { successData, ActionResponse } from './action-response';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { appConfig } from '../helpers/config';

@Injectable({
  providedIn: 'root'
})
export class TaskTokensService {

  constructor(private http: HttpClient) {}

  getTaskToken(itemId: string, attemptId: string, asTeamId? : string): Observable<string> {
    const params = asTeamId ? new HttpParams({ fromObject: { as_team_id: asTeamId } }) : {};
    return this.http
      .post<ActionResponse<{task_token: string}>>(`${appConfig.apiUrl}/items/${itemId}/attempts/${attemptId}/generate-task-token`, null,
        params)
      .pipe(map(successData))
      .pipe(map(data => data.task_token));
  }
}
