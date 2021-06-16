import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { SimpleActionResponse, assertSuccess } from './action-response';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { appConfig } from '../helpers/config';

@Injectable({
  providedIn: 'root'
})
export class AnswerActionsService {

  constructor(private http: HttpClient) {}

  updateCurrent(itemId: string, attemptId: string, answer: string, state: string, asTeamId? : string): Observable<void> {
    const body = { answer, state };
    const params = asTeamId ? new HttpParams({ fromObject: { as_team_id: asTeamId } }) : {};
    return this.http
      .put<SimpleActionResponse>(`${appConfig.apiUrl}/items/${itemId}/attempts/${attemptId}/answers/current`, body, params)
      .pipe(map(assertSuccess));
  }
}
