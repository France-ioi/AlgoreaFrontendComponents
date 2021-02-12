import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { NavMenuItem } from '../../http-services/item-navigation.service';
import { defaultAttemptId } from 'src/app/shared/helpers/attempts';
import { ItemTypeCategory } from 'src/app/shared/helpers/item-type';
import { ItemRouter } from 'src/app/shared/services/item-router';
import { NavTreeData } from '../../services/left-nav-loading/nav-tree-data';

// ItemTreeNode is PrimeNG tree node with data forced to be an item
interface ItemTreeNode extends TreeNode {
  data: NavMenuItem
  itemPath: string[]
  status: 'ready'|'loading'|'error',
  locked: boolean,
  checked: boolean,
}

@Component({
  selector: 'alg-left-nav-tree',
  templateUrl: './left-nav-tree.component.html',
  styleUrls: [ './left-nav-tree.component.scss' ]
})
export class LeftNavTreeComponent implements OnChanges {
  @Input() data?: NavTreeData<NavMenuItem>;
  @Input() elementType: ItemTypeCategory | 'group' = 'activity';

  nodes: ItemTreeNode[] = [];
  selectedNode?: ItemTreeNode; // used to keep track after request that the selected is still the expected one

  constructor(
    private itemRouter: ItemRouter,
  ) {}

  private mapItemToNodes(data: NavTreeData<NavMenuItem>): ItemTreeNode[] {
    return data.elements.map(i => {
      const isSelected = !!(data.selectedElementId && data.selectedElementId === i.id);
      const shouldShowChildren = i.hasChildren && isSelected;
      const pathToChildren = data.pathToElements.concat([ i.id ]);
      const locked = !i.canViewContent;
      return {
        label: i.title ?? undefined,
        data: i,
        itemPath: data.pathToElements,
        type: i.hasChildren ? 'folder' : 'leaf',
        leaf: i.hasChildren,
        status: i.hasChildren && isSelected && !i.children ? 'loading' : 'ready',
        children: (shouldShowChildren && i.children) ? this.mapItemToNodes(new NavTreeData(i.children, pathToChildren)) : undefined,
        expanded: !!(shouldShowChildren && i.children),
        checked: isSelected,
        locked: locked,
        selectable: !locked,
      };
    });
  }

  ngOnChanges(_changes: SimpleChanges): void {
    this.nodes = this.data ? this.mapItemToNodes(this.data) : [];
  }

  navigateToNode(node: ItemTreeNode, attemptId?: string): void {
    const routeBase = { id: node.data.id, path: node.itemPath };
    if (attemptId) {
      this.itemRouter.navigateTo({ ...routeBase, attemptId: attemptId });
      return;
    }
    const parentAttemptId = this.parentAttemptForNode(node);
    if (!parentAttemptId) return; // unexpected
    this.itemRouter.navigateTo({ ...routeBase, parentAttemptId: parentAttemptId });
  }

  navigateToParent(): void {
    if (!this.data?.parent?.attemptId) return; // unexpected!
    this.itemRouter.navigateTo({
      id: this.data.parent.id,
      path: this.data.pathToElements.slice(0, -1),
      attemptId: this.data.parent.attemptId,
    });
  }

  selectNode(node: ItemTreeNode): void {
    this.selectedNode = node;

    // set the node to "loading" so that the user knows the children should appear shortly
    if (!node.locked && node.data.hasChildren && !node.data.children) node.status = 'loading';

    this.navigateToNode(node, node.data.attemptId === null ? undefined : node.data.attemptId);
  }

  onKeyDown(e: KeyboardEvent): void {
    if (e.code === 'Space' || e.code === 'Enter') {
      e.stopPropagation();
      e.preventDefault();
      document.activeElement
        ?.querySelector<HTMLElement>('.p-treenode-label .node-tree-item > .node-item-content > .node-label')
        ?.click();
    } else if (e.code === 'ArrowDown' || e.code === 'ArrowUp') {
      e.stopPropagation();
      e.preventDefault();
      document.activeElement
        ?.querySelector('.p-treenode-label .node-tree-item > .node-item-content > .node-label')
        ?.scrollIntoView({
          behavior: 'auto',
          block: 'center',
        });
    }
  }

  /**
   * Return whether the given node is at the first level of the displayed tree (root) (i.e. is not a children)
   */
  isFirstLevelNode(node: ItemTreeNode): boolean {
    return this.nodes.some(n => n.data.id === node.data.id);
  }

  /**
   * Return the parent attemp id of this node.
   * If the node is a one of the "root" items, use this.parent
   * Otherwise use the parent node.
   * In a regular case, this function should never return 'undefined'
   */
  parentAttemptForNode(node: ItemTreeNode): string|undefined {
    if (node.parent) {
      const parent = node.parent as ItemTreeNode;
      return parent.data.attemptId || undefined /* unexpected */;
    } else if (this.data?.parent) {
      return this.data.parent.attemptId || undefined /* unexpected */;
    }
    return defaultAttemptId; // if the node has no parent, i.e. is a root, use default attempt
  }

}