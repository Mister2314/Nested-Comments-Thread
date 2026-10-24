import { useEffect, useRef, useState } from 'react'
import styles from './ReplyForm.module.css'

interface ReplyFormProps {
  onSubmit: (content: string) => void
  onCancel?: () => void
  placeholder?: string
  autoFocus?: boolean
  initialText?: string
  label?: string
}

export default function ReplyForm({
  onSubmit,
  onCancel,
  placeholder = 'Add a message…',
  autoFocus = true,
  initialText = '',
  label,
}: ReplyFormProps) {
  const [content, setContent] = useState(initialText)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus()
  }, [autoFocus])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (content.trim()) {
      onSubmit(content.trim())
      setContent('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.replyForm} aria-label={label}>
      <input
        ref={inputRef}
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        className={styles.inputField}
        aria-label={label ?? placeholder}
      />
      <div className={styles.buttonGroup}>
        {onCancel && (
          <button type="button" onClick={onCancel} className={styles.cancelBtn}>
            Cancel
          </button>
        )}
        <button type="submit" className={styles.submitBtn} disabled={!content.trim()}>
          {onCancel ? 'Reply' : 'Post'}
        </button>
      </div>
    </form>
  )
}
