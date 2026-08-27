import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './unit-ui.css'
import './food-loader.css'
import './mobile-fixes.css'
import App from './AppV2.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
