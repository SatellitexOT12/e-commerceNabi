import React, { useState } from 'react'
import { HashRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { CartProvider } from './contexts/CartContext'
import { Header } from './components/Header'
import { Home } from './pages/Home'
import { Shop } from './pages/Shop'
import { Checkout } from './pages/Checkout'
import { Admin } from './pages/Admin'
import { Blog } from './pages/Blog'
import { CartModal } from './components/CartModal'
import './App.css'

function AppContent() {
  const navigate = useNavigate()
  const [isCartOpen, setIsCartOpen] = useState(false)

  const handleCheckout = () => {
    setIsCartOpen(false)
    navigate('/checkout')
  }

  const handleBack = () => {
    navigate('/shop')
  }

  return (
    <>
      <Header onCartClick={() => setIsCartOpen(true)} onAdminClick={() => navigate('/admin')} />
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} onCheckout={handleCheckout} />
      
      <Routes>
        <Route path="/" element={<Home onShopClick={() => navigate('/shop')} />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/checkout" element={<Checkout onBack={handleBack} />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/blog" element={<Blog />} />
      </Routes>

      <Toaster position="top-right" />
    </>
  )
}

function App() {
  return (
    <CartProvider>
      <Router>
        <AppContent />
      </Router>
    </CartProvider>
  )
}

export default App