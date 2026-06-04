import React from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './context/AuthContext.jsx'
import { FitnessProvider } from './context/FitnessContext.jsx'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <FitnessProvider>
        <App />
      </FitnessProvider>
    </AuthProvider>
  </React.StrictMode>
)
