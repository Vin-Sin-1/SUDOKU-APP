import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import SudokuApp from './SudokuApp.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SudokuApp />
  </StrictMode>,
)
