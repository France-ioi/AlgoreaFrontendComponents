import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscriber, timer } from 'rxjs';
import { delay, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
/** Service allowing modifications of the layout */
export class LayoutService {

  private leftMenuAndHeadersDisplayed = new BehaviorSubject<boolean>(true);
  leftMenuAndHeadersDisplayed$ = this.leftMenuAndHeadersDisplayed.asObservable().pipe(delay(0));
  private leftMenuAndHeadersTimeFiltered = false;
  private leftMenuAndHeadersTimeFilter?: Subscriber<void>;

  private withTask = new BehaviorSubject<boolean>(false);
  withTask$ = this.withTask.asObservable().pipe(delay(0));

  constructor() {
    const leftMenuAndHeadersTimeFilterObservable =
      new Observable(subscriber => this.leftMenuAndHeadersTimeFilter = subscriber);
    leftMenuAndHeadersTimeFilterObservable
      .pipe(switchMap(() => timer(120000)))
      .subscribe(() => this.leftMenuAndHeadersTimeFiltered = false);
  }

  /**
   * Toggles the left menu and headers
   * @param {boolean} shown If supplied, force the new state to this boolean
   * @param {boolean} automatic Was called automatically (and not from a user manual action)
   * @param {boolean} timeFiltered Do not execute if a manual action was executed recently
   * @returns {void}
   */
  toggleLeftMenuAndHeaders(shown?: boolean, automatic = false, timeFiltered = false): void {
    if (!automatic) {
      // Manual user action, start the timer
      this.leftMenuAndHeadersTimeFiltered = true;
      this.leftMenuAndHeadersTimeFilter?.next();
    } else if (timeFiltered && this.leftMenuAndHeadersTimeFiltered) {
      return;
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
