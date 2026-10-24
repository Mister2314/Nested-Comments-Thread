import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ThreadItem } from '../types'
import { makeItem } from '../types'
import { mapTree, removeTree } from '../utils/tree'

const STORAGE_KEY = 'threadItems'
const COLLAPSE_KEY = 'threadCollapsed'

function normalize(items: ThreadItem[], parentId: number | null = null): ThreadItem[] {
  return items.map((item) => ({
    ...item,
    parentId,
    timestamp: new Date(item.timestamp).toISOString(),
    replies: normalize(item.replies ?? [], item.id),
  }))
}

function loadItems(): ThreadItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? normalize(JSON.parse(saved) as ThreadItem[]) : []
  } catch {
    return []
  }
}

function loadCollapsed(): Set<number> {
  try {
    const saved = localStorage.getItem(COLLAPSE_KEY)
    return new Set(saved ? (JSON.parse(saved) as number[]) : [])
  } catch {
    return new Set()
  }
}

export function useThread() {
  const [threadItems, setThreadItems] = useState<ThreadItem[]>(loadItems)
  const [collapsed, setCollapsed] = useState<Set<number>>(loadCollapsed)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(threadItems))
  }, [threadItems])

  useEffect(() => {
    localStorage.setItem(COLLAPSE_KEY, JSON.stringify([...collapsed]))
  }, [collapsed])

  const addThreadItem = useCallback((content: string, parentId: number | null = null) => {
    const fresh = makeItem(content, parentId)
    setThreadItems((prev) =>
      parentId === null ? [fresh, ...prev] : mapTree(prev, parentId, (p) => ({ ...p, replies: [...p.replies, fresh] }))[0],
    )
    return fresh.id
  }, [])

  const editThreadItem = useCallback((itemId: number, newContent: string) => {
    setThreadItems((prev) =>
      mapTree(prev, itemId, (item) => ({ ...item, text: newContent, edited: true }))[0],
    )
  }, [])

  const removeThreadItem = useCallback((itemId: number) => {
    setThreadItems((prev) => removeTree(prev, itemId)[0])
  }, [])

  const rateThreadItem = useCallback((itemId: number, ratingType: 'like' | 'dislike') => {
    setThreadItems((prev) =>
      mapTree(prev, itemId, (item) => ({
        ...item,
        likes: ratingType === 'like' ? item.likes + 1 : item.likes,
        dislikes: ratingType === 'dislike' ? item.dislikes + 1 : item.dislikes,
      }))[0],
    )
  }, [])

  const toggleCollapsed = useCallback((itemId: number) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(itemId)) next.delete(itemId)
      else next.add(itemId)
      return next
    })
  }, [])

  return useMemo(
    () => ({ threadItems, addThreadItem, editThreadItem, removeThreadItem, rateThreadItem, collapsed, toggleCollapsed }),
    [threadItems, addThreadItem, editThreadItem, removeThreadItem, rateThreadItem, collapsed, toggleCollapsed],
  )
}
