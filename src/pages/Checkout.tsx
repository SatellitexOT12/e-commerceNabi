import React, { useState } from 'react'
import { useCart } from '../contexts/CartContext'
import { useForm } from 'react-hook-form'
import { generateOrderMessage, sendToBothNumbers } from '../utils/whatsapp'
import { saveOrder } from '../services/orders'
import { formatPrice } from '../utils/formatPrice'
import './Checkout.css'
import toast from 'react-hot-toast'

interface CheckoutFormData {
  nombre: string
  direccion: string
  telefono: string
  fecha_entrega: string
}

export const Checkout: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { state, clearCart } = useCart()
  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutFormData>()
  const [loading, setLoading] = useState(false)

  const onSubmit = async (data: CheckoutFormData) => {
    if (state.items.length === 0) {
      toast.error('El carrito está vacío')
      return
    }

    try {
      setLoading(true)

      // Guardar orden en Supabase
      const order = {
        cliente_nombre: data.nombre,
        cliente_direccion: data.direccion,
        cliente_telefono: '+53' + data.telefono,
        productos: state.items,
        total: state.total,
        estado: 'pendiente',
        fecha_entrega: data.fecha_entrega
      }

      await saveOrder(order)

      // Generar mensaje
      const message = generateOrderMessage(order)

      // Enviar a ambos números de WhatsApp
      await sendToBothNumbers(message)

      // Limpiar carrito
      clearCart()
      localStorage.removeItem('cart')

      toast.success('Pedido enviado exitosamente')
      onBack()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al enviar el pedido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="checkout">
      <div className="checkout-container">
        <h1>Completar Compra</h1>

        <div className="checkout-content">
          <form onSubmit={handleSubmit(onSubmit)} className="checkout-form">
            <div className="form-group">
              <label>Nombre Completo *</label>
              <input
                {...register('nombre', { required: 'El nombre es requerido' })}
                placeholder="Tu nombre"
              />
              {errors.nombre && <span className="error">{errors.nombre.message}</span>}
            </div>

            <div className="form-group">
              <label>Dirección de Entrega *</label>
              <input
                {...register('direccion', { required: 'La dirección es requerida' })}
                placeholder="Tu dirección"
              />
              {errors.direccion && <span className="error">{errors.direccion.message}</span>}
            </div>

            <div className="form-group">
              <label>Teléfono *</label>
              <div className="phone-input">
                <span className="phone-prefix">+53</span>
                <input
                  {...register('telefono', {
                    required: 'El teléfono es requerido',
                    pattern: {
                      value: /^[0-9]{8}$/,
                      message: 'Ingresa los 8 dígitos restantes'
                    }
                  })}
                  placeholder="XXXXXXX"
                />
              </div>
              {errors.telefono && <span className="error">{errors.telefono.message}</span>}
            </div>

            <div className="form-group">
              <label>Fecha de Entrega *</label>
              <input
                type="date"
                {...register('fecha_entrega', { required: 'La fecha de entrega es requerida' })}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.fecha_entrega && <span className="error">{errors.fecha_entrega.message}</span>}
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Procesando...' : 'Enviar Pedido por WhatsApp'}
            </button>
          </form>

          <div className="order-summary">
            <h2>Resumen del Pedido</h2>
            {state.items.map(item => {
              const agregosPrice = item.agregos?.reduce((sum, agg) => sum + (agg.precio * (agg.cantidad || 1)), 0) || 0
              const itemTotal = (item.product.precio * item.quantity) + agregosPrice
              return (
                <div key={item.product.id} className="summary-item">
                  <div className="item-info">
                    <span>{item.product.nombre} x{item.quantity}</span>
                    <span>{formatPrice(item.product.precio * item.quantity)}</span>
                  </div>
                  {item.agregos && item.agregos.length > 0 && (
                    <div className="item-agregos">
                      {item.agregos.map((agrego, idx) => (
                        <span key={idx} className="agrego-item">
                          + {agrego.nombre} {agrego.cantidad && agrego.cantidad > 1 ? `x${agrego.cantidad}` : ''} - {formatPrice(agrego.precio * (agrego.cantidad || 1))}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
            <div className="summary-total">
              <strong>Total:</strong>
              <strong>{formatPrice(state.total)}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}