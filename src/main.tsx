/* Main entry point for the application - renders the root React component */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './main.css'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Failed to find the root element')
}

// @skip-protected: Do not remove. Required for React rendering.
createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
