import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { flattenTree } from './utils/tree'
import type { ThreadItem as ThreadItemType } from './types'
import { useThread } from './hooks/useThread'
import ThreadItem from './components/Comment/ThreadItem'
import ReplyForm from './components/Comment/ReplyForm'
import styles from './App.module.css'

function App() {
  const { threadItems, ...controller } = useThread()
  const [selectedId, setSelectedId] = useState<number | null>(threadItems[0]?.id ?? null)
  const [replyingId, setReplyingId] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const flat = useRef<{ item: ThreadItemType; depth: number }[]>([])
  const nodeRefs = useRef<Map<number, HTMLDivElement>>(new Map())

  useEffect(() => {
    flat.current = flattenTree(threadItems)
    if (!selectedId || !flat.current.find((f) => f.item.id === selectedId)) {
      setSelectedId(flat.current[0]?.item.id ?? null)
    }
  }, [threadItems, selectedId])

  const registerNode = useCallback((id: number, el: HTMLDivElement | null) => {
    if (el) nodeRefs.current.set(id, el)
    else nodeRefs.current.delete(id)
  }, [])

  const onStartReply = useCallback((id: number) => {
    setEditingId(null)
    setReplyingId((prev) => (prev === id ? null : id))
  }, [])

  const onStartEdit = useCallback((id: number) => {
    setReplyingId(null)
    setEditingId((prev) => (prev === id ? null : id))
  }, [])

  const onCancelModes = useCallback(() => {
    setReplyingId(null)
    setEditingId(null)
  }, [])

  const moveSelection = useCallback((delta: number) => {
    if (flat.current.length === 0) return
    const idx = flat.current.findIndex((f) => f.item.id === selectedId)
    let next = Math.max(0, Math.min(flat.current.length - 1, idx + delta))
    const nextId = flat.current[next]?.item.id
    if (nextId) setSelectedId(nextId)
  }, [selectedId])

  const handleKeyDown = (e: {
    key: string
    preventDefault: () => void
    target: EventTarget | null
  }) => {
    const target = e.target as HTMLElement | null
    const isInput = !!target?.matches('input, textarea, [contenteditable]')
    if (isInput) return

    switch (e.key) {
      case 'ArrowDown':
      case 'j':
        e.preventDefault()
        moveSelection(1)
        break
      case 'ArrowUp':
      case 'k':
        e.preventDefault()
        moveSelection(-1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedId !== null) onStartReply(selectedId)
        break
      case 'e':
        if (selectedId !== null) onStartEdit(selectedId)
        break
      case 'Delete':
        if (selectedId !== null) {
          controller.removeThreadItem(selectedId)
          onCancelModes()
        }
        break
      case 'c':
        if (selectedId !== null) controller.toggleCollapsed(selectedId)
        break
      case 'Escape':
        onCancelModes()
        break
    }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => handleKeyDown(e)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  })

  return (
    <div className={styles.pageWrapper} role="tree" aria-label="Discussion thread">
      <div className={styles.mainContainer}>
        <h1 className={styles.pageTitle}>Discussion Thread</h1>

        <ReplyForm
          onSubmit={(content) => {
            controller.addThreadItem(content, null)
          }}
          label="New top-level comment"
        />

        <div className={styles.threadList} role="group">
          <AnimatePresence initial={false} mode="popLayout">
            {threadItems.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                transition={{ duration: 0.22, delay: i * 0.04 }}
              >
                <ThreadItem
                  threadItem={item}
                  depth={0}
                  controller={controller}
                  selectedId={selectedId}
                  replyingId={replyingId}
                  editingId={editingId}
                  onStartReply={onStartReply}
                  onStartEdit={onStartEdit}
                  onCancelModes={onCancelModes}
                  registerNode={registerNode}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {threadItems.length === 0 && (
            <p className={styles.emptyState}>
              No comments yet. Start the conversation.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default App

