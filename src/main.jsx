import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
const basename = "/";
import { Toaster } from "react-hot-toast";

import "@fontsource/manrope/index.css";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import "@fontsource/manrope/800.css";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { fontSize: "14px" }
        }}
      />

      <App />
    </BrowserRouter>
  </React.StrictMode>
)
