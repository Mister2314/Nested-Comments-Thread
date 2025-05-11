import { useState } from 'react'
import styles from './ReplyForm.module.css'

function ReplyForm({ onSubmit, onCancel, placeholder = 'Add a message...' }) {
  const [content, setContent] = useState('')
  
  const handleSubmit = (e) => {
    e.preventDefault()
    if (content.trim()) {
      onSubmit(content)
      setContent('')
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className={styles.replyForm}>
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        className={styles.inputField}
        autoFocus
      />
      <div className={styles.buttonGroup}>
        {onCancel && (
          <button 
            type="button"
            onClick={onCancel}
            className={styles.cancelBtn}
          >
            Cancel
          </button>
        )}
        <button 
          type="submit" 
          className={styles.submitBtn}
          disabled={!content.trim()}
        >
          {onCancel ? 'Reply' : 'Post'}
        </button>
      </div>
    </form>
  )
}

export default ReplyForm