import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './lib/supabase/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from "@/components/ui/toaster";
import { Provider } from 'react-redux'
import { store } from './store'

// Performance optimization: Use React.StrictMode only in development
const root = ReactDOM.createRoot(document.getElementById('root')!);

if (process.env.NODE_ENV === 'development') {
  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <BrowserRouter>
          <App />
          <Toaster />
        </BrowserRouter>
      </Provider>
    </React.StrictMode>,
  );
} else {
  root.render(
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster />
      </BrowserRouter>
    </Provider>,
  );
}
