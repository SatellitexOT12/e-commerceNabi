import React from 'react'
import { useNavigate } from 'react-router-dom'
import './Footer.css'

export const Footer: React.FC = () => {
  const navigate = useNavigate()
  const go = (path: string, hash?: string) => {
    navigate(path)
    if (hash) setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  return (
    <footer className="colophon">
      <div className="colophon-inner">
        <div className="colophon-brand">
          <p className="colophon-nameplate">Mini Nabi</p>
          <p className="colophon-line">
            Crepes y mini donas artesanales, hechos a mano y entregados en La Habana.
          </p>
        </div>

        <nav className="colophon-col" aria-label="Índice">
          <h2>Índice</h2>
          <button onClick={() => go('/')}>Portada</button>
          <button onClick={() => go('/shop')}>Tienda</button>
          <button onClick={() => go('/blog')}>Entradas</button>
        </nav>

        <div className="colophon-col">
          <h2>Recogida</h2>
          <p>Miramar</p>
          <p>El Cerro</p>
          <p className="colophon-note">Mensajería con costo adicional</p>
        </div>

        <div className="colophon-col">
          <h2>Pago</h2>
          <p>Efectivo (CUP)</p>
          <p>Transferencia</p>
          <p>Dólares</p>
        </div>
      </div>

      <div className="colophon-rule" />
      <p className="colophon-data">
        Mini Nabi · La Habana · Cuaderno de recetas · {new Date().getFullYear()}
      </p>
    </footer>
  )
}
