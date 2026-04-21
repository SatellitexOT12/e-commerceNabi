import React, { useState, useEffect } from 'react'
import { ShoppingCart, LogOut } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { getCurrentUser, signOut } from '../services/auth'
import { useNavigate } from 'react-router-dom'
import './Header.css'

export const Header: React.FC<{ onCartClick: () => void }> = ({ onCartClick }) => {
  const { state } = useCart()
  const [user, setUser] = useState<any>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const checkUser = async () => {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    }
    checkUser()
  }, [])

  const handleSignOut = async () => {
    await signOut()
    setUser(null)
    navigate('/')
  }

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo" onClick={() => navigate('/')}>
          <h1>🍰 MiniNabi</h1>
        </div>
        <nav className="nav-links">
          <button onClick={() => {
            navigate('/')
            setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100)
          }} className="nav-link">Inicio</button>
          <button onClick={() => navigate('/shop')} className="nav-link">Productos</button>
          <button onClick={() => {
            navigate('/')
            setTimeout(() => document.getElementById('historia')?.scrollIntoView({ behavior: 'smooth' }), 100)
          }} className="nav-link">Historia</button>
          <button onClick={() => {
            navigate('/')
            setTimeout(() => document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' }), 100)
          }} className="nav-link">Contactos</button>
          {user && (
            <button onClick={handleSignOut} className="logout-btn">
              <LogOut size={20} /> Salir
            </button>
          )}
        </nav>
        <button onClick={onCartClick} className="cart-btn">
          <ShoppingCart size={24} />
          {state.items.length > 0 && <span className="cart-count">{state.items.length}</span>}
        </button>
      </div>
    </header>
  )
}