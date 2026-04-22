import React from 'react'
import { useCart } from '../contexts/CartContext'
import { X, Plus, Minus } from 'lucide-react'
import { formatPrice } from '../utils/formatPrice'
import './CartModal.css'

interface CartModalProps {
  isOpen: boolean
  onClose: () => void
  onCheckout: () => void
}

export const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose, onCheckout }) => {
  const { state, removeItem, updateQuantity } = useCart()

  if (!isOpen) return null

  return (
    <div className="cart-modal-overlay" onClick={onClose}>
      <div className="cart-modal" onClick={e => e.stopPropagation()}>
        <div className="cart-header">
          <h2>Carrito de Compras</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {state.items.length === 0 ? (
          <div className="empty-cart">
            <p>Tu carrito está vacío</p>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {state.items.map(item => {
                const agregosPrice = item.agregos?.reduce((sum, agg) => sum + (agg.precio * (agg.cantidad || 1)), 0) || 0
                const itemTotal = (item.product.precio * item.quantity) + agregosPrice
                return (
                  <div key={item.product.id} className="cart-item">
                    <img src={item.product.imagen_url} alt={item.product.nombre} />
                    <div className="item-details">
                      <h4>{item.product.nombre}</h4>
                      <p className="item-price">{formatPrice(item.product.precio)}</p>
                      {item.agregos && item.agregos.length > 0 && (
                        <div className="item-agregos">
                          {item.agregos.map((agg, idx) => (
                            <p key={idx} className="agrego-text">
                              + {agg.nombre} {agg.cantidad && agg.cantidad > 1 ? `x${agg.cantidad}` : ''}: {formatPrice(agg.precio * (agg.cantidad || 1))}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="quantity-control">
                      <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>
                        <Minus size={18} />
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>
                        <Plus size={18} />
                      </button>
                    </div>
                    <div className="item-subtotal">
                      {formatPrice(itemTotal)}
                    </div>
                    <button className="remove-btn" onClick={() => removeItem(item.product.id)}>
                      <X size={18} />
                    </button>
                  </div>
                )
              })}
            </div>

            <div className="cart-footer">
              <div className="cart-total">
                <strong>Total:</strong>
                <strong>{formatPrice(state.total)}</strong>
              </div>
              <button className="checkout-btn" onClick={onCheckout}>
                Proceder al Pago
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}