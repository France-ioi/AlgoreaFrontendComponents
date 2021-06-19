import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ContentInfo } from '../models/content/content-info';

/**
 * Use this service to track what's the current item display in the content (right) pane.
 */
@Injectable({
  providedIn: 'root'
})
export class CurrentContentService implements OnDestroy {
  /* info about the currently displayed content */
  current = new BehaviorSubject<ContentInfo|null>(null);
  currentContent$ = this.current.asObservable();

  updateSameContent(updater: (content: ContentInfo) => ContentInfo): void {
    // Emit again the same content, but updated by the updater
    if (this.current.value !== null) {
      this.current.next(updater(this.current.value));
    }
  }

  ngOnDestroy(): void {
    this.current.complete();
  }
}
