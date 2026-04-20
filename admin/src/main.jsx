import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios';
import './index.css'
import App from './App.jsx'
axios.defaults.timeout = 10000;
axios.defaults.baseURL = import.meta.env.VITE_API_HOST
createRoot(document.getElementById('root')).render(
  <App />
)
