import { StrictMode } from 'react'
//helps to identify the errors
import { createRoot } from 'react-dom/client'
//where my application should go live
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
  
    <GoogleOAuthProvider clientId="402733537351-egplqfjo071t6rocbvp98vgafjs60g2p.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
