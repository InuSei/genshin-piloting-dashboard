import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { PriceEditor } from './pages/PriceEditor.tsx'
import App from './App.tsx'
import { ClientPricelist } from './pages/ClientPricelist.tsx'
import './styles/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Your private admin dashboard */}
        <Route path="/" element={<App />} />
        
        {/* The public read-only link you send to clients */}
        <Route path="/pricelist" element={<ClientPricelist />} />
        <Route path="/admin/prices" element={<PriceEditor />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)