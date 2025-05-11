import { useState } from 'react'
import ReplyForm from './ReplyForm'
import styles from './ThreadItem.module.css'

function ThreadItem({ threadItem, onModify, loggedInUserId }) {
  const [isCreatingReply, setIsCreatingReply] = useState(false)
  const [isModifying, setIsModifying] = useState(false)
  const [modifiedContent, setModifiedContent] = useState(threadItem.text)

  const isOwnedByCurrentUser = threadItem.user.id === loggedInUserId

  const submitReply = (content) => {
    const freshReply = {
      id: Date.now(),
      text: content,
      user: { id: loggedInUserId, name: 'Current User', initials: 'CU' },
      timestamp: new Date(),
      likes: 0,
      dislikes: 0,
      replies: []
    }
    onModify(prev => prev.map(item => 
      item.id === threadItem.id 
        ? { ...item, replies: [...item.replies, freshReply] } 
        : item
    ))
    setIsCreatingReply(false)
  }

  const submitEdit = () => {
    onModify(prev => prev.map(item => 
      item.id === threadItem.id 
        ? { ...item, text: modifiedContent, edited: true } 
        : item
    ))
    setIsModifying(false)
  }

  const removeItem = () => {
    if (window.confirm('Are you sure you want to delete this thread item?')) {
      onModify(prev => prev.filter(item => item.id !== threadItem.id))
    }
  }

  const handleRating = (ratingType) => {
    onModify(prev => prev.map(item => 
      item.id === threadItem.id 
        ? { 
            ...item, 
            likes: ratingType === 'like' ? item.likes + 1 : item.likes,
            dislikes: ratingType === 'dislike' ? item.dislikes + 1 : item.dislikes
          } 
        : item
    ))
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  return (
    <div className={styles.threadItem} data-id={threadItem.id}>
      <div className={styles.threadHeader}>
        <div className={styles.userAvatar}>
          <span>{threadItem.user.initials}</span>
        </div>
        <div className={styles.userInfo}>
          <h4 className={styles.userName}>{threadItem.user.name}</h4>
          <span className={styles.postTime}>{formatDate(threadItem.timestamp)}</span>
        </div>
      </div>
      
      {isModifying ? (
        <div className={styles.editContainer}>
          <textarea
            value={modifiedContent}
            onChange={(e) => setModifiedContent(e.target.value)}
            className={styles.editField}
            rows="3"
          />
          <div className={styles.editActions}>
            <button onClick={submitEdit} className={styles.saveBtn}>
              <span className={styles.btnIcon}>✓</span>
              Save
            </button>
            <button onClick={() => setIsModifying(false)} className={styles.cancelBtn}>
              <span className={styles.btnIcon}>✕</span>
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
          <button onClick={() => handleRating('like')} className={styles.ratingBtn}>
            <span className={styles.ratingIcon}>👍</span>
            <span className={styles.ratingCount}>{threadItem.likes}</span>
          </button>
          <button onClick={() => handleRating('dislike')} className={styles.ratingBtn}>
            <span className={styles.ratingIcon}>👎</span>
            <span className={styles.ratingCount}>{threadItem.dislikes}</span>
          </button>
        </div>
        
        <div className={styles.actionButtons}>
          <button onClick={() => setIsCreatingReply(!isCreatingReply)} className={styles.actionBtn}>
            <span className={styles.actionIcon}>💬</span>
            Reply
          </button>
          
          {isOwnedByCurrentUser && (
            <>
              <button onClick={() => setIsModifying(!isModifying)} className={styles.actionBtn}>
                <span className={styles.actionIcon}>✏️</span>
                Edit
              </button>
              <button onClick={removeItem} className={styles.actionBtn}>
                <span className={styles.actionIcon}>🗑️</span>
                Delete
              </button>
            </>
          )}
        </div>
      </div>
      
      {isCreatingReply && (
        <div className={styles.replyFormWrapper}>
          <ReplyForm 
            onSubmit={submitReply} 
            onCancel={() => setIsCreatingReply(false)}
            placeholder="Share your thoughts..."
          />
        </div>
      )}
      
      {threadItem.replies && threadItem.replies.length > 0 && (
        <div className={styles.threadReplies}>
          {threadItem.replies.map(reply => (
            <ThreadItem 
              key={reply.id} 
              threadItem={reply} 
              onModify={(updateFn) => 
                onModify(prev => prev.map(item => 
                  item.id === threadItem.id 
                    ? { ...item, replies: updateFn(item.replies) } 
                    : item
                ))
              }
              loggedInUserId={loggedInUserId}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default ThreadItem