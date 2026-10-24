export interface ThreadUser {
  id: number
  name: string
  initials: string
}

export interface ThreadItem {
  id: number
  text: string
  user: ThreadUser
  /** ISO string or Date — normalized to ISO on load */
  timestamp: string | Date
  likes: number
  dislikes: number
  replies: ThreadItem[]
  parentId: number | null
  edited?: boolean
}

export const CURRENT_USER: ThreadUser = { id: 1, name: 'Current User', initials: 'CU' }

export function makeItem(text: string, parentId: number | null = null): ThreadItem {
  return {
    id: Date.now() + Math.floor(Math.random() * 1000),
    text,
    user: CURRENT_USER,
    timestamp: new Date().toISOString(),
    likes: 0,
    dislikes: 0,
    replies: [],
    parentId,
  }
}
