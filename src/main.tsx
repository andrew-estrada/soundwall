import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CallbackPage } from './auth/CallbackPage'
import './styles/global.css'
import App from './App.tsx'

const isCallbackRoute = window.location.pathname === '/callback'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isCallbackRoute ? <CallbackPage /> : <App />}
  </StrictMode>,
)
