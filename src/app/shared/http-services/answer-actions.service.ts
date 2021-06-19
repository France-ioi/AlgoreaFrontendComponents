import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { SimpleActionResponse, assertSuccess, ActionResponse, successData } from './action-response';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { appConfig } from '../helpers/config';

@Injectable({
  providedIn: 'root'
})
export class AnswerActionsService {

  constructor(private http: HttpClient) {}

  getAnswerToken(answer: string, taskToken: string): Observable<string> {
    /*const params = new HttpParams();
    params.set('answer', answer);
    params.set('task_token', taskToken);*/
    const params = { answer, task_token: taskToken };
    return this.http
      .post<ActionResponse<{ answer_token: string}>>(`${appConfig.apiUrl}/answers`, params)
      .pipe(map(successData))
      .pipe(map(data => data.answer_token));
  }

  saveGrade(taskToken: string, score: number, answerToken?: string, scoreToken?: string): Observable<void> {
    const params : {[key: string]: any } = { task_token: taskToken, answer_token: answerToken, score_token: scoreToken, score };
    return this.http
      .post<SimpleActionResponse>(`${appConfig.apiUrl}/items/save-grade`, params)
      .pipe(map(assertSuccess));
  }

  updateCurrent(itemId: string, attemptId: string, answer: string, state: string, asTeamId? : string): Observable<void> {
    const body = { answer, state };
    const params = asTeamId ? new HttpParams({ fromObject: { as_team_id: asTeamId } }) : {};
    return this.http
      .put<SimpleActionResponse>(`${appConfig.apiUrl}/items/${itemId}/attempts/${attemptId}/answers/current`, body, params)
      .pipe(map(assertSuccess));
  }
}
