import React, { useState, useEffect } from 'react'
import { ShoppingCart, LogOut, Menu, X, Croissant } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { getCurrentUser, signOut } from '../services/auth'
import { useNavigate } from 'react-router-dom'
import './Header.css'

export const Header: React.FC<{ onCartClick: () => void }> = ({ onCartClick }) => {
  const { state } = useCart()
  const [user, setUser] = useState<any>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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
    setMobileMenuOpen(false)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <header className="header">
      <div className="header-container">
      <div 
        className="logo" 
        onClick={() => { navigate('/'); closeMobileMenu() }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            navigate('/')
            closeMobileMenu()
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Ir a inicio - MiniNabi"
      >
        <span className="logo-mark"><Croissant size={22} strokeWidth={1.5} aria-hidden="true" /></span>
        <h1>Mini Nabi</h1>
        <span className="logo-folio">La Habana · crepes y mini donas</span>
      </div>
        
        <button 
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <nav className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <button onClick={() => { navigate('/'); closeMobileMenu() }} className="nav-link">Inicio</button>
          <button onClick={() => { navigate('/shop'); closeMobileMenu() }} className="nav-link">Productos</button>
          <button onClick={() => { navigate('/blog'); closeMobileMenu() }} className="nav-link">Blog</button>
          <button onClick={() => { navigate('/'); setTimeout(() => document.getElementById('historia')?.scrollIntoView({ behavior: 'smooth' }), 100); closeMobileMenu() }} className="nav-link">Historia</button>
          <button onClick={() => { navigate('/'); setTimeout(() => document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' }), 100); closeMobileMenu() }} className="nav-link">Contactos</button>
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