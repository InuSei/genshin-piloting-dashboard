import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { PriceEditor } from './pages/PriceEditor.tsx'
import App from './App.tsx'
import HsrApp from './pages/HsrApp.tsx'
import { GenshinPricelist, HsrPricelist } from './pages/ClientPricelist.tsx'
import './styles/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Your private admin dashboards */}
        <Route path="/" element={<App />} />
        <Route path="/hsr" element={<HsrApp />} />

        {/* The public read-only link you send to clients */}
        <Route path="/pricelist/genshin" element={<GenshinPricelist />} />
        <Route path="/pricelist/hsr" element={<HsrPricelist />} />
        <Route path="/pricelist" element={<Navigate to="/pricelist/genshin" replace />} />

        <Route path="/admin/prices" element={<PriceEditor />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)