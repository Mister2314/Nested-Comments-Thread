import type { ThreadItem } from '../types'

/** Immutable deep map over the tree. Returns [nextTree, matched]. */
export function mapTree(
  items: ThreadItem[],
  id: number,
  fn: (item: ThreadItem) => ThreadItem,
): [ThreadItem[], boolean] {
  let matched = false
  const next = items.map((item) => {
    if (item.id === id) {
      matched = true
      return fn(item)
    }
    if (item.replies.length > 0) {
      const [replies, hit] = mapTree(item.replies, id, fn)
      if (hit) {
        matched = true
        return { ...item, replies }
      }
    }
    return item
  })
  return [next, matched]
}

/** Immutable deep remove. Returns [nextTree, removed]. */
export function removeTree(
  items: ThreadItem[],
  id: number,
): [ThreadItem[], boolean] {
  let removed = false
  const next: ThreadItem[] = []
  for (const item of items) {
    if (item.id === id) {
      removed = true
      continue
    }
    if (item.replies.length > 0) {
      const [replies, hit] = removeTree(item.replies, id)
      if (hit) {
        removed = true
        next.push({ ...item, replies })
        continue
      }
    }
    next.push(item)
  }
  return [next, removed]
}

/** Flatten in visual order (depth-first), carrying depth. */
export interface FlatItem {
  item: ThreadItem
  depth: number
}

export function flattenTree(items: ThreadItem[], depth = 0, out: FlatItem[] = []): FlatItem[] {
  for (const item of items) {
    out.push({ item, depth })
    flattenTree(item.replies, depth + 1, out)
  }
  return out
}
