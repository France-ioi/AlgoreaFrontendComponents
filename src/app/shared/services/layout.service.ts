import { Injectable } from '@angular/core';
import { BehaviorSubject, timer } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  // Service allowing modifications of the layout

  private leftMenuAndHeadersDisplayed = new BehaviorSubject<boolean>(true);
  leftMenuAndHeadersDisplayed$ = this.leftMenuAndHeadersDisplayed.asObservable().pipe(delay(0));
  private leftMenuAndHeadersTimeFiltered = false;

  private withTask = new BehaviorSubject<boolean>(false);
  withTask$ = this.withTask.asObservable().pipe(delay(0));

  toggleLeftMenuAndHeaders(shown?: boolean, timeFiltered?: boolean): void {
    if (timeFiltered && this.leftMenuAndHeadersTimeFiltered) {
      return;
    } else if (!timeFiltered) {
      this.leftMenuAndHeadersTimeFiltered = true;
      timer(60000).subscribe(() => this.leftMenuAndHeadersTimeFiltered = false);
    }
    if (shown !== undefined) {
      this.leftMenuAndHeadersDisplayed.next(shown);
    } else {
      this.leftMenuAndHeadersDisplayed.next(!this.leftMenuAndHeadersDisplayed.value);
    }
  }

  toggleWithTask(newState: boolean): void {
    this.withTask.next(newState);
  }
}
