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

  updateSameContent(updater: (content: ContentInfo) => ContentInfo | null): void {
    // Emit again the same content, but updated by the updater
    // If updater returns null then abort
    if (this.current.value !== null) {
      const updatedValue = updater(this.current.value);
      if (updatedValue !== null) {
        this.current.next(updatedValue);
      }
    }
  }

  ngOnDestroy(): void {
    this.current.complete();
  }
}
