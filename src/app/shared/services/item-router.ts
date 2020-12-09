import { Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { ItemRoute, isRouteWithAttempt, attemptParamName, parentAttemptParamName, pathParamName } from '../helpers/item-route';

@Injectable({
  providedIn: 'root'
})
export class ItemRouter {

  constructor(
    private router: Router,
  ) {}

  /**
   * Navigate to given item, on the path page.
   * If page is not given and we are currently on an item page, use the same page. Otherwise, default to 'details'.
   */
  navigateTo(item: ItemRoute, path?: 'edit'|'details'): void {
    void this.router.navigateByUrl(this.url(item, path));
  }

  /**
   * Navigate to an item with missing path and attempt
   */
  navigateToIncompleteItem(itemId: string): void {
    void this.router.navigate([ 'items', 'by-id', itemId ]);
  }

  /**
   * Return a url to given item, on the path page.
   * If page is not given and we are currently on an item page, use the same page. Otherwise, default to 'details'.
   */
  url(item: ItemRoute, path?: 'edit'|'details'): UrlTree {
    const dest = path ? [ path ] : (this.currentPage() || [ 'details' ]);
    const params: {[k: string]: any} = {};
    if (isRouteWithAttempt(item)) params[attemptParamName] = item.attemptId;
    else params[parentAttemptParamName] = item.parentAttemptId;
    params[pathParamName] = item.path;
    return this.router.createUrlTree([ 'items', 'by-id', item.id, params ].concat(dest));
  }

  /**
   * Extract (bit hacky) the item sub-page of the current page.
   * Return undefined if we are not on an "item" page
   */
  private currentPage(): string[]|undefined {
    const currentPageUrlChildren = this.router.parseUrl(this.router.url).root.children;
    if (!('primary' in currentPageUrlChildren)) return undefined;
    const segments = currentPageUrlChildren['primary'].segments;
    if (segments.length < 3 || segments[0].path !== 'items' || segments[1].path !== 'by-id') return undefined;
    return segments.slice(3).map(segment => segment.path);
  }

}