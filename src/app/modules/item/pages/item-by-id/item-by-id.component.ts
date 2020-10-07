import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { FetchError, Fetching, isReady, Ready } from 'src/app/shared/helpers/state';
import { CurrentContentService } from 'src/app/shared/services/current-content.service';
import { isPathGiven, itemDetailsRoute, itemFromDetailParams } from 'src/app/shared/services/nav-types';
import { ItemDataSource, ItemData } from '../../services/item-datasource.service';

const ItemBreadcrumbCat = 'Items';

/**
 * ItemByIdComponent is just a container for detail or edit page but manages the fetching on id change and (un)setting the current content.
 */
@Component({
  selector: 'alg-item-by-id',
  templateUrl: './item-by-id.component.html',
  styleUrls: ['./item-by-id.component.scss'],
  providers: [ ItemDataSource ]
})
export class ItemByIdComponent implements OnDestroy {

  private subscription: Subscription; // subscriptions to be freed up on destroy

  constructor(
    private activatedRoute: ActivatedRoute,
    private currentContent: CurrentContentService,
    private itemDataSource: ItemDataSource,
  ) {

    // on route change: refetch item if needed
    this.activatedRoute.paramMap.subscribe(params => {
      const navItem = itemFromDetailParams(params);
      if (!navItem) return; // unexpected as this component should not be routed if id is missing
      currentContent.setCurrent({ type: 'item', data: navItem, breadcrumbs: { category: ItemBreadcrumbCat, path: [], currentPageIdx: -1} });
      if (!isPathGiven(params)) {
        // TODO: handle no path given
        return;
      }
      if (!navItem.attemptId && !navItem.parentAttemptId) {
        // TODO: handle no attempt given
        return;
      }
      this.itemDataSource.fetchItem(navItem);
    });

    // on state change, update current content page info (for breadcrumb)
    this.subscription = this.itemDataSource.state$.pipe(
      filter<Ready<ItemData>|Fetching|FetchError,Ready<ItemData>>(isReady),
      map(state => ({
        type: 'item',
        breadcrumbs: {
          category: ItemBreadcrumbCat,
          path: state.data.breadcrumbs.map((el, idx) => ({
            title: el.title,
            hintNumber: el.attemptCnt,
            navigateTo: itemDetailsRoute({
              itemId: el.itemId,
              attemptId: el.attemptId,
              itemPath: state.data.breadcrumbs.slice(0,idx).map(it => it.itemId),
            }),
          })),
          currentPageIdx: state.data.breadcrumbs.length - 1,
        },
        title: state.data.item.string.title === null ? undefined : state.data.item.string.title,
        data: state.data.nav,
      }))
    ).subscribe(p => this.currentContent.setCurrent(p));
  }

  ngOnDestroy() {
    this.currentContent.setCurrent(null);
    this.subscription.unsubscribe();
  }

}
