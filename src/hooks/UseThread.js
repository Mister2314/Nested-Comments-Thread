import { useState, useEffect } from 'react'

export default function useThreads() {
  const [threadItems, setThreadItems] = useState(() => {
    const saved = localStorage.getItem('threadItems')
    return saved ? JSON.parse(saved) : []
  })
  
  useEffect(() => {
    localStorage.setItem('threadItems', JSON.stringify(threadItems))
  }, [threadItems])
  
  const addThreadItem = (content, parentId = null) => {
    const newItem = {
      id: Date.now(),
      text: content,
      user: { id: 1, name: 'Current User', initials: 'CU' },
      timestamp: new Date(),
      likes: 0,
      dislikes: 0,
      replies: [],
      parentId
    }
    
    if (parentId === null) {
      setThreadItems(prev => [newItem, ...prev])
    } else {
      setThreadItems(prev => 
        prev.map(item => 
          item.id === parentId
            ? { ...item, replies: [...item.replies, newItem] }
            : item
        )
      )
    }
  }
  
  const editThreadItem = (itemId, newContent) => {
    setThreadItems(prev => 
      prev.map(item => 
        item.id === itemId
          ? { ...item, text: newContent, edited: true }
          : item
      )
    )
  }
  
  const removeThreadItem = (itemId) => {
    setThreadItems(prev => prev.filter(item => item.id !== itemId))
  }
  
  const rateThreadItem = (itemId, ratingType) => {
    setThreadItems(prev => 
      prev.map(item => 
        item.id === itemId
          ? { 
              ...item, 
              likes: ratingType === 'like' ? item.likes + 1 : item.likes,
              dislikes: ratingType === 'dislike' ? item.dislikes + 1 : item.dislikes
            }
          : item
      )
    )
  }
  
  return { 
    threadItems, 
    setThreadItems, 
    addThreadItem, 
    editThreadItem, 
    removeThreadItem, 
    rateThreadItem 
  }
}