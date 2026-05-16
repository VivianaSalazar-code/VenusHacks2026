import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/App' // or whatever your main component is
import './styles/index.css' // your tailwind css

// 1. IMPORT YOUR PROVIDER (Double check the path matches your folders!)
import { BackendProvider } from './app/providers/BackendProvider'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* 2. WRAP YOUR APP IN THE PROVIDER */}
    <BackendProvider>
      <App />
    </BackendProvider>
  </React.StrictMode>,
)
  