import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import SudokuApp from '../sudoku.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SudokuApp />
  </StrictMode>,
)
