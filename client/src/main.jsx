import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from "@tanstack/react-query"
import App from './App.jsx'
import './index.css'
import { queryClient } from "./lib/queryClient.jsx"
import { AuthProvider } from "./providers/AuthProvider"


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>

        <AuthProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AuthProvider>
    
    </QueryClientProvider>
  </React.StrictMode>,
)
