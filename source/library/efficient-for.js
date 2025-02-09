import { Cell } from '@adbl/cells';
import {
  ArgumentList,
  createCommentPair,
  generateChildNodes,
  getMostCurrentFunction,
} from './utils.js';
import { linkNodesToComponent } from '../render/index.js';

// @ts-ignore: Deno has issues with @import tags.
/** @import { JSX } from '../jsx-runtime/index.d.ts' */
// @ts-ignore: Deno has issues with @import tags.
/** @import { ForOptions } from './for.js' */

/**
 * Creates a dynamic mapping of an iterable to DOM nodes, efficiently updating when the iterable changes.
 *
 * @template {Iterable<any>} U
 * @template [V=U extends Iterable<infer V> ? V : never]
 * @param {Cell<U> | U} list - The iterable or Cell containing an iterable to map over
 * @param {((item: V, index: Cell<number>, iter: U) => JSX.Template)} fn - Function to create a Template for each item
 * @param {ForOptions<V>} [options]
 * @returns {JSX.Template} - A Template representing the mapped items
 *
 * @example
 * // Create a reactive list of names
 * const names = Cell.source(['Alice', 'Bob', 'Charlie']);
 *
 * // Use For to create a dynamic list of <li> elements
 * const listItems = For(names, (name, index) => {
 *   const li = document.createElement('li');
 *   li.textContent = `${index.value + 1}. ${name}`;
 *   return li;
 * });
 *
 * // Append the list items to a <ul> element
 * const ul = document.createElement('ul');
 * ul.append(...listItems);
 * document.body.appendChild(ul);
 *
 * // Later, update the names
 * names.value.push('David');
 * // The list will automatically update to include the new name
 */
// TODO: Make object mutation safe or optional.
export function EfficientFor(list, fn, options) {
  /*** @type {Node[]} */
  let initialSnapshot = [];
  const func = getMostCurrentFunction(fn);

  // -----------------------------------------------
  // STATIC LISTS
  // -----------------------------------------------
  if (!Cell.isCell(list)) {
    let i = 0;
    for (const item of list) {
      /** @type {[any, Cell<number>, typeof list]} */
      const parameters = [item, Cell.source(i), list];
      const nodes = generateChildNodes(func(...parameters));
      linkNodesToComponent(nodes, func, new ArgumentList(parameters));
      initialSnapshot.push(...nodes);
      i++;
    }
    return initialSnapshot;
  }

  // -----------------------------------------------
  // REACTIVE LISTS
  // -----------------------------------------------
  /** @type {Map<any, { index: Cell<number>,  nodes: ChildNode[] }>} */
  let cacheFromLastRun = new Map();
  const uniqueItemMarker = options?.key ?? Symbol();
  const [listStart, listEnd] = createCommentPair();

  /**
   * @param {any} item
   * @param {number} i
   */
  const retrieveOrSetItemKey = (item, i) => {
    let itemKey;
    const isObject = item && /^(object|function|symbol)$/.test(typeof item);
    if (isObject) itemKey = item[uniqueItemMarker];
    else itemKey = item?.toString ? `${item.toString()}.${i}` : i;
    if (itemKey === undefined) {
      itemKey = Symbol();
      item[uniqueItemMarker] = itemKey;
    }
    return itemKey;
  };

  // First run, prior to any changes.
  let i = 0;
  for (const item of list.value) {
    const index = Cell.source(i);
    const parameters = [item, index, list];
    const template = func(...parameters);
    const nodes = /** @type {ChildNode[]} */ (generateChildNodes(template));
    linkNodesToComponent(nodes, func, new ArgumentList(parameters));
    initialSnapshot.push(...nodes);

    const itemKey = retrieveOrSetItemKey(item, i);
    cacheFromLastRun.set(itemKey, { index, nodes });
    i++;
  }

  /** @param {U} _list */
  const reactToListChanges = (_list) => {
    const newCache = new Map();
    const func = getMostCurrentFunction(fn);

    let index = 0;
    for (const item of _list) {
      let itemKey = retrieveOrSetItemKey(item, index);
      const cachedResult = cacheFromLastRun.get(itemKey);
      if (cachedResult === undefined) {
        const i = Cell.source(index);
        /** @type {[any, Cell<number>, typeof _list]} */
        const parameters = [item, i, _list];
        const newTemplate = func(...parameters);
        const nodes = /** @type {ChildNode[]} */ (
          generateChildNodes(newTemplate)
        );
        linkNodesToComponent(nodes, func, new ArgumentList(parameters));
        newCache.set(itemKey, { nodes, index: i });
      } else {
        /** @type {import('@adbl/cells').SourceCell<number>} */
        (cachedResult.index).value = index;
        newCache.set(itemKey, cachedResult);
      }
      index++;
    }

    // Removing Deleted Nodes:
    //
    // This pass is necessary to remove nodes in one go,
    // rather than bubbling them to the end of the list.
    //
    // e.g. Consider a scenario where a list changes from [A, B, C, D, E] to [B, C, D, E]
    // The ideal solution is just a removeChild(A), but without this pass, what would have
    // happened is:
    //  [A, B, C, D, E] -> [B, A, C, D, E]
    //  [B, A, C, D, E] -> [B, C, A, D, E]
    //  [B, C, A, D, E] -> [B, C, D, A, E]
    //  [B, C, D, A, E] -> [B, C, D, E, A]
    // before removing A, result in a removal and reinsertion of several unchanged nodes.
    for (const [key, value] of cacheFromLastRun) {
      if (!newCache.has(key)) {
        if (value.nodes.length === 0) continue;
        if (value.nodes.length === 1) value.nodes[0].remove();
        else {
          const range = globalThis.window.document.createRange();
          range.setStartBefore(value.nodes[0]);
          range.setEndAfter(value.nodes[value.nodes.length - 1]);
          range.deleteContents();
        }
      }
    }

    /** @type {ChildNode} */
    let lastInserted = listStart;

    // Reordering and Inserting New Nodes:
    //
    // This pass ensures nodes are in the correct order and new nodes are inserted.
    // It compares each node's current position with the expected position after lastInserted,
    // moving nodes only when necessary to maintain the correct sequence.
    for (const item of _list) {
      /** @type {ChildNode[]} */
      let nodes = newCache.get(retrieveOrSetItemKey(item, index))?.nodes;

      if (lastInserted.nextSibling !== nodes[0]) lastInserted.after(...nodes);
      lastInserted = nodes[nodes.length - 1] ?? lastInserted;
    }

    cacheFromLastRun = newCache;
  };

  // Track next changes
  list.listen(reactToListChanges, { weak: true });

  // Prevents premature garbage collection.
  const persistedSet = new Set();
  persistedSet.add(list);
  persistedSet.add(reactToListChanges);
  Reflect.set(listStart, '__attributeCells', persistedSet);
  return [listStart, ...initialSnapshot, listEnd];
}
