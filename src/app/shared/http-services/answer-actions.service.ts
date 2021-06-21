import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { SimpleActionResponse, assertSuccess, ActionResponse, successData } from './action-response';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { appConfig } from '../helpers/config';

declare type AnswerType = "Submission"|"Saved"|"Current";

interface RawAnswerMetadata {
  created_at: string,
  id: string,
  score: number|null,
  type: AnswerType,
  user: {
    first_name: string,
    last_name: string,
    login: string
  }
}

export interface AnswerMetadata {
  createdAt: Date,
  id: string,
  score: number|null,
  type: AnswerType,
  user: {
    firstName: string,
    lastName: string,
    login: string
  }
}

interface RawAnswerInfo {
  answer: string|null,
  attempt_id: string|null,
  author_id: string,
  created_at: string,
  graded_at: string|null,
  id: string,
  item_id: string,
  score: number|null,
  state: string,
  type: AnswerType
}

export interface AnswerInfo {
  answer: string|null,
  attemptId: string|null,
  authorId: string,
  createdAt: Date,
  gradedAt: Date|null,
  id: string,
  itemId: string,
  score: number|null,
  state: string,
  type: AnswerType
}

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

  listAnswers(itemId: string, authorId: string): Observable<AnswerMetadata[]> {
    const params:{[key:string]: any} = { author_id: authorId };
    return this.http
      .get<RawAnswerMetadata[]>(`${appConfig.apiUrl}/items/${itemId}/answers`, { params })
      .pipe(map(data => data.map(r => ({
        createdAt: new Date(r.created_at),
        id: r.id,
        score: r.score,
        type: r.type,
        user: {
          firstName: r.user.first_name,
          lastName: r.user.last_name,
          login: r.user.login
        }
      }))));
  }

  getAnswer(answerId: string): Observable<AnswerInfo> {
    return this.http
      .get<RawAnswerInfo>(`${appConfig.apiUrl}/answers/${answerId}`)
      .pipe(map(r => ({
        answer: r.answer,
        attemptId: r.attempt_id,
        authorId: r.author_id,
        createdAt: new Date(r.created_at),
        gradedAt: r.graded_at === null ? null : new Date(r.graded_at),
        id: r.id,
        itemId: r.item_id,
        score: r.score,
        state: r.state,
        type: r.type
      })));
  }

  updateCurrent(itemId: string, attemptId: string, answer: string, state: string, asTeamId? : string): Observable<void> {
    const body = { answer, state };
    const params = asTeamId ? new HttpParams({ fromObject: { as_team_id: asTeamId } }) : {};
    return this.http
      .put<SimpleActionResponse>(`${appConfig.apiUrl}/items/${itemId}/attempts/${attemptId}/answers/current`, body, params)
      .pipe(map(assertSuccess));
  }
}
