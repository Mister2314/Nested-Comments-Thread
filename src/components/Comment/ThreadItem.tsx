import { memo, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import type { ThreadItem } from '../../types'
import { CURRENT_USER } from '../../types'
import ReplyForm from './ReplyForm'
import styles from './ThreadItem.module.css'

export interface ThreadController {
  addThreadItem: (content: string, parentId: number | null) => number
  editThreadItem: (itemId: number, newContent: string) => void
  removeThreadItem: (itemId: number) => void
  rateThreadItem: (itemId: number, ratingType: 'like' | 'dislike') => void
  collapsed: Set<number>
  toggleCollapsed: (itemId: number) => void
}

interface ThreadItemProps {
  threadItem: ThreadItem
  depth: number
  controller: ThreadController
  selectedId: number | null
  replyingId: number | null
  editingId: number | null
  onStartReply: (id: number) => void
  onStartEdit: (id: number) => void
  onCancelModes: () => void
  registerNode: (id: number, el: HTMLDivElement | null) => void
}

const MAX_DEPTH = 4

function formatDate(timestamp: string | Date) {
  return new Date(timestamp).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function timeAgo(timestamp: string | Date) {
  const diff = Date.now() - new Date(timestamp).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function ThreadItem({
  threadItem,
  depth,
  controller,
  selectedId,
  replyingId,
  editingId,
  onStartReply,
  onStartEdit,
  onCancelModes,
  registerNode,
}: ThreadItemProps) {
  const reduced = useReducedMotion()
  const isReplying = replyingId === threadItem.id
  const isEditing = editingId === threadItem.id
  const isOwned = threadItem.user.id === CURRENT_USER.id
  const isCollapsed = controller.collapsed.has(threadItem.id)
  const hasReplies = threadItem.replies.length > 0
  const [pop, setPop] = useState<'like' | 'dislike' | null>(null)
  const nodeRef = useRef<HTMLDivElement | null>(null)
  const editRef = useRef<HTMLTextAreaElement | null>(null)
  const [editText, setEditText] = useState(threadItem.text)

  useEffect(() => {
    registerNode(threadItem.id, nodeRef.current)
    return () => registerNode(threadItem.id, null)
  }, [threadItem.id, registerNode])

  useEffect(() => {
    if (isEditing) editRef.current?.focus()
  }, [isEditing])

  useEffect(() => {
    if (selectedId === threadItem.id) nodeRef.current?.focus({ preventScroll: false })
  }, [selectedId, threadItem.id])

  const visualDepth = Math.min(depth, MAX_DEPTH)

  return (
    <motion.div
      layout={!reduced}
      className={styles.threadItem}
      data-depth={visualDepth}
      data-id={threadItem.id}
      style={depth > 0 ? { ['--indent' as string]: `${depth >= MAX_DEPTH ? 0 : 24}px` } : undefined}
    >
      {depth > 0 && <span className={styles.depthRail} aria-hidden="true" />}
      <motion.div
        ref={nodeRef}
        tabIndex={selectedId === threadItem.id ? 0 : -1}
        role="treeitem"
        aria-level={depth + 1}
        aria-expanded={hasReplies ? !isCollapsed : undefined}
        aria-selected={selectedId === threadItem.id}
        data-selected={selectedId === threadItem.id || undefined}
        className={styles.card}
        initial={reduced ? false : { opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduced ? undefined : { opacity: 0, height: 0, marginBottom: 0, overflow: 'hidden' }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        onFocus={() => {
          /* selection is driven by App keyboard handler */
        }}
      >
        <div className={styles.threadHeader}>
          <div className={styles.userAvatar} aria-hidden="true">
            <span>{threadItem.user.initials}</span>
          </div>
          <div className={styles.userInfo}>
            <h4 className={styles.userName}>{threadItem.user.name}</h4>
            <span className={styles.postTime} title={formatDate(threadItem.timestamp)}>
              {timeAgo(threadItem.timestamp)}
            </span>
          </div>
          {hasReplies && (
            <button
              type="button"
              className={styles.collapseBtn}
              onClick={() => controller.toggleCollapsed(threadItem.id)}
              aria-expanded={!isCollapsed}
              aria-label={isCollapsed ? `Expand ${threadItem.replies.length} replies` : `Collapse ${threadItem.replies.length} replies`}
            >
              <motion.span animate={{ rotate: isCollapsed ? -90 : 0 }} transition={{ duration: 0.18 }}>
                ▾
              </motion.span>
              <span className={styles.collapseCount}>{threadItem.replies.length}</span>
            </button>
          )}
        </div>

        {isEditing ? (
          <div className={styles.editContainer}>
            <textarea
              ref={editRef}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  controller.editThreadItem(threadItem.id, editText)
                  onCancelModes()
                }
                if (e.key === 'Escape') onCancelModes()
              }}
              className={styles.editField}
              rows={3}
              aria-label="Edit comment"
            />
            <div className={styles.editActions}>
              <button
                type="button"
                className={styles.saveBtn}
                onClick={() => {
                  controller.editThreadItem(threadItem.id, editText)
                  onCancelModes()
                }}
              >
                Save
              </button>
              <button type="button" className={styles.cancelBtn} onClick={onCancelModes}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.threadContent}>
            <p>{threadItem.text}</p>
            {threadItem.edited && <span className={styles.editedBadge}>edited</span>}
          </div>
        )}

        <div className={styles.threadActions}>
          <div className={styles.ratingButtons}>
            <button
              type="button"
              className={styles.ratingBtn}
              aria-label={`Like comment, ${threadItem.likes} likes`}
              onClick={() => {
                controller.rateThreadItem(threadItem.id, 'like')
                setPop('like')
              }}
            >
              <motion.span
                key={`like-${pop === 'like' ? threadItem.likes : 'idle'}`}
                className={styles.ratingIcon}
                animate={pop === 'like' && !reduced ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                transition={{ duration: 0.25 }}
              >
                ▲
              </motion.span>
              <span className={styles.ratingCount}>{threadItem.likes}</span>
            </button>
            <button
              type="button"
              className={styles.ratingBtn}
              aria-label={`Dislike comment, ${threadItem.dislikes} dislikes`}
              onClick={() => {
                controller.rateThreadItem(threadItem.id, 'dislike')
                setPop('dislike')
              }}
            >
              <motion.span
                key={`dislike-${pop === 'dislike' ? threadItem.dislikes : 'idle'}`}
                className={styles.ratingIcon}
                animate={pop === 'dislike' && !reduced ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                transition={{ duration: 0.25 }}
              >
                ▼
              </motion.span>
              <span className={styles.ratingCount}>{threadItem.dislikes}</span>
            </button>
          </div>

          <div className={styles.actionButtons}>
            <button type="button" className={styles.actionBtn} onClick={() => onStartReply(threadItem.id)}>
              Reply
            </button>
            {isOwned && (
              <>
                <button type="button" className={styles.actionBtn} onClick={() => onStartEdit(threadItem.id)}>
                  Edit
                </button>
                <button
                  type="button"
                  className={styles.actionBtnDanger}
                  onClick={() => {
                    controller.removeThreadItem(threadItem.id)
                    onCancelModes()
                  }}
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>

        <AnimatePresence initial={false}>
          {isReplying && (
            <motion.div
              key="reply"
              className={styles.replyFormWrapper}
              initial={reduced ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={reduced ? undefined : { opacity: 0, height: 0, overflow: 'hidden' }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <ReplyForm
                onSubmit={(content) => {
                  controller.addThreadItem(content, threadItem.id)
                  onCancelModes()
                }}
                onCancel={onCancelModes}
                placeholder="Share your thoughts…"
                label={`Reply to comment ${threadItem.id}`}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence initial={false}>
        {hasReplies && !isCollapsed && (
          <motion.div
            key="replies"
            className={styles.threadReplies}
            role="group"
            initial={reduced ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={reduced ? undefined : { opacity: 0, height: 0, overflow: 'hidden' }}
            transition={{ duration: reduced ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {threadItem.replies.map((reply, i) => (
              <motion.div
                key={reply.id}
                initial={reduced ? false : { opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? undefined : { opacity: 0 }}
                transition={{ duration: 0.2, delay: reduced ? 0 : i * 0.04 }}
              >
                <ThreadItem
                  threadItem={reply}
                  depth={depth + 1}
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default memo(ThreadItem)

