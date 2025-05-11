import { useState } from 'react'
import ReplyForm from './components/Comment/ReplyForm'
import ThreadItem from './components/Comment/ThreadItem'
import styles from './App.module.css'

function App() {
  const [threadItems, setThreadItems] = useState([])
  
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.mainContainer}>
        <h1 className={styles.pageTitle}>Discussion Thread</h1>
        
        <ReplyForm 
          onSubmit={(content) => setThreadItems([...threadItems, { 
            id: Date.now(), 
            text: content, 
            user: { id: 1, name: 'Current User', initials: 'CU' },
            timestamp: new Date(),
            likes: 0,
            dislikes: 0,
            replies: []
          }])} 
        />
        
        <div className={styles.threadList}>
          {threadItems.map(item => (
            <ThreadItem 
              key={item.id} 
              threadItem={item} 
              onModify={setThreadItems}
              loggedInUserId={1}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default App