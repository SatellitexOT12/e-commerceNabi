import React, { useEffect, useRef } from 'react'
import { useCart } from '../contexts/CartContext'
import { X, Plus, Minus, ShoppingCart } from 'lucide-react'
import { formatPrice } from '../utils/formatPrice'
import './CartModal.css'

interface CartModalProps {
  isOpen: boolean
  onClose: () => void
  onCheckout: () => void
}

export const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose, onCheckout }) => {
  const { state, removeItem, updateQuantity } = useCart()
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const itemCount = state.items.reduce((total, item) => total + item.quantity, 0)

  return (
    <div className="cart-modal-overlay" onClick={onClose}>
      <div
        className="cart-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-modal-title"
        ref={panelRef}
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
      >
        <div className="cart-header">
          <div className="cart-heading">
            <h2 id="cart-modal-title">Carrito</h2>
            <p className="cart-count">
              {itemCount} {itemCount === 1 ? 'artículo' : 'artículos'} en el ticket
            </p>
          </div>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Cerrar carrito">
            <X size={22} aria-hidden="true" />
          </button>
        </div>

        {state.items.length === 0 ? (
          <div className="empty-cart">
            <ShoppingCart size={30} aria-hidden="true" className="empty-mark" />
            <p className="empty-stamp">Carrito vacío</p>
            <p className="empty-body">
              Aquí aún no hay nada anotado. Elige crepes o mini donas en la tienda y
              aparecerán en este ticket con su precio.
            </p>
            <button type="button" className="ghost-btn" onClick={onClose}>
              Seguir comprando
            </button>
          </div>
        ) : (
          <>
            <ul className="cart-items">
              {state.items.map(item => {
                const agregosPrice = item.agregos?.reduce((sum, agg) => sum + (agg.precio * (agg.cantidad || 1)), 0) || 0
                const itemTotal = (item.product.precio * item.quantity) + agregosPrice
                return (
                  <li key={item.product.id} className="cart-item">
                    <img
                      className="item-thumb"
                      src={item.product.imagen_url}
                      alt={item.product.nombre}
                    />
                    <div className="item-main">
                      <div className="item-top">
                        <h3 className="item-name">{item.product.nombre}</h3>
                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() => removeItem(item.product.id)}
                          aria-label={`Quitar ${item.product.nombre} del carrito`}
                        >
                          <X size={16} aria-hidden="true" />
                        </button>
                      </div>

                      {item.agregos && item.agregos.length > 0 && (
                        <ul className="item-agregos">
                          {item.agregos.map((agg, idx) => (
                            <li key={idx} className="agrego-text">
                              + {agg.nombre}
                              {agg.cantidad && agg.cantidad > 1 ? ` x${agg.cantidad}` : ''}
                              <span className="agrego-amount">
                                {formatPrice(agg.precio * (agg.cantidad || 1))}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}

                      <div className="item-bottom">
                        <div
                          className="quantity-control"
                          role="group"
                          aria-label={`Cantidad de ${item.product.nombre}`}
                        >
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            aria-label={
                              item.quantity === 1
                                ? `Eliminar ${item.product.nombre} del carrito`
                                : `Quitar una unidad de ${item.product.nombre}`
                            }
                          >
                            <Minus size={16} aria-hidden="true" />
                          </button>
                          <span className="qty-value">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            aria-label={`Añadir una unidad de ${item.product.nombre}`}
                          >
                            <Plus size={16} aria-hidden="true" />
                          </button>
                        </div>
                        <span className="item-subtotal">{formatPrice(itemTotal)}</span>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>

            <div className="cart-footer">
              <div className="cart-total">
                <span className="cart-total-label">Total</span>
                <span className="cart-total-amount">{formatPrice(state.total)}</span>
              </div>
              <button type="button" className="checkout-btn" onClick={onCheckout}>
                Finalizar Compra
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
