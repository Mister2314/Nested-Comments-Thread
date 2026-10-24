import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
// @ts-expect-error CSS side-effect import
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)