import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

import * as serviceWorkerRegistration from './serviceWorkerRegistration.ts'
import './styles/style.scss'
import "@fontsource/roboto"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
