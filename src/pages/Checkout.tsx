import React, { useState } from 'react'
import { useCart } from '../contexts/CartContext'
import { useForm } from 'react-hook-form'
import { generateOrderMessage, sendToBothNumbers } from '../utils/whatsapp'
import { saveOrder } from '../services/orders'
import { formatPrice } from '../utils/formatPrice'
import { AlertCircle, ArrowLeft, ClipboardList } from 'lucide-react'
import './Checkout.css'
import toast from 'react-hot-toast'

interface CheckoutFormData {
  nombre: string
  direccion: string
  telefono: string
  fecha_entrega: string
  detalles?: string
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
        fecha_entrega: data.fecha_entrega,
        detalles: data.detalles || ''
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

  const itemCount = state.items.reduce((total, item) => total + item.quantity, 0)
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="checkout">
      {/* Franja de la hoja: la única zona inundada de rosa */}
      <div className="checkout-band">
        <div className="checkout-band-inner">
          <div className="checkout-title-block">
            <h1>Hoja de pedido</h1>
            <p className="checkout-standfirst">
              Anota los datos del encargo, revisa el resumen y envíalo por WhatsApp.
            </p>
          </div>
          <button type="button" className="checkout-back" onClick={onBack}>
            <ArrowLeft size={16} aria-hidden="true" />
            Volver a la tienda
          </button>
        </div>
      </div>

      <div className="checkout-container">
        <div className="checkout-content">
          <form onSubmit={handleSubmit(onSubmit)} className="checkout-form">
            <h2 className="sheet-heading">Datos del encargo</h2>

            <div className={`form-group${errors.nombre ? ' has-error' : ''}`}>
              <label htmlFor="co-nombre">
                Nombre completo
                <span className="req-mark" aria-hidden="true">*</span>
                <span className="sr-only"> (obligatorio)</span>
              </label>
              <input
                id="co-nombre"
                type="text"
                autoComplete="name"
                placeholder="Como quieres que te llamemos"
                aria-invalid={errors.nombre ? true : undefined}
                aria-describedby={errors.nombre ? 'co-nombre-error' : undefined}
                {...register('nombre', {
                  required: 'Escribe tu nombre completo: será la firma del pedido.'
                })}
              />
              {errors.nombre && (
                <span className="error" id="co-nombre-error" role="alert">
                  <AlertCircle size={15} aria-hidden="true" />
                  {errors.nombre.message}
                </span>
              )}
            </div>

            <div className={`form-group${errors.direccion ? ' has-error' : ''}`}>
              <label htmlFor="co-direccion">
                Dirección de entrega
                <span className="req-mark" aria-hidden="true">*</span>
                <span className="sr-only"> (obligatorio)</span>
              </label>
              <input
                id="co-direccion"
                type="text"
                autoComplete="street-address"
                placeholder="Calle, número y referencia cercana"
                aria-invalid={errors.direccion ? true : undefined}
                aria-describedby={errors.direccion ? 'co-direccion-error' : undefined}
                {...register('direccion', {
                  required: 'Falta la dirección: indica calle y número para poder entregar.'
                })}
              />
              {errors.direccion && (
                <span className="error" id="co-direccion-error" role="alert">
                  <AlertCircle size={15} aria-hidden="true" />
                  {errors.direccion.message}
                </span>
              )}
            </div>

            <div className={`form-group${errors.telefono ? ' has-error' : ''}`}>
              <label htmlFor="co-telefono">
                Teléfono
                <span className="req-mark" aria-hidden="true">*</span>
                <span className="sr-only"> (obligatorio) con código +53</span>
              </label>
              <div className="phone-input">
                <span className="phone-prefix" aria-hidden="true">+53</span>
                <input
                  id="co-telefono"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  placeholder="XXXXXXXX"
                  aria-invalid={errors.telefono ? true : undefined}
                  aria-describedby={errors.telefono ? 'co-telefono-error' : undefined}
                  {...register('telefono', {
                    required: 'Falta el teléfono: escribe los 8 dígitos que van después de +53.',
                    pattern: {
                      value: /^[0-9]{8}$/,
                      message: 'No son 8 dígitos: revisa el número y déjalo solo con cifras.'
                    }
                  })}
                />
              </div>
              {errors.telefono && (
                <span className="error" id="co-telefono-error" role="alert">
                  <AlertCircle size={15} aria-hidden="true" />
                  {errors.telefono.message}
                </span>
              )}
            </div>

            <div className={`form-group${errors.fecha_entrega ? ' has-error' : ''}`}>
              <label htmlFor="co-fecha">
                Fecha de entrega
                <span className="req-mark" aria-hidden="true">*</span>
                <span className="sr-only"> (obligatorio)</span>
              </label>
              <input
                id="co-fecha"
                type="date"
                min={today}
                aria-invalid={errors.fecha_entrega ? true : undefined}
                aria-describedby={errors.fecha_entrega ? 'co-fecha-error' : undefined}
                {...register('fecha_entrega', {
                  required: 'Elige la fecha de entrega: el pedido no puede quedar sin día.'
                })}
              />
              {errors.fecha_entrega && (
                <span className="error" id="co-fecha-error" role="alert">
                  <AlertCircle size={15} aria-hidden="true" />
                  {errors.fecha_entrega.message}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="co-detalles">
                Detalles o notas del encargo
                <span className="req-mark optional" aria-hidden="true">(opcional)</span>
              </label>
              <textarea
                id="co-detalles"
                rows={4}
                placeholder="Ejemplo: sin azúcar, extra crema, etc."
                {...register('detalles')}
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading} aria-busy={loading}>
              {loading ? 'Enviando el pedido…' : 'Enviar pedido por WhatsApp'}
            </button>
            <p className="submit-note">
              El pedido se guarda en el cuaderno y se abre WhatsApp para despacharlo.
            </p>
          </form>

          <aside className="order-summary" aria-labelledby="co-summary-title">
            <div className="ticket-head">
              <h2 id="co-summary-title">Resumen del pedido</h2>
              <span className="ticket-count">
                {itemCount} {itemCount === 1 ? 'artículo' : 'artículos'}
              </span>
            </div>

            {state.items.length === 0 ? (
              <div className="ticket-empty">
                <ClipboardList size={26} aria-hidden="true" className="empty-mark" />
                <p className="empty-title">La hoja está en blanco</p>
                <p className="empty-body">
                  Todavía no hay ningún encargo anotado. Vuelve a la tienda, elige tus dulces
                  y aparecerán aquí con su precio.
                </p>
                <button type="button" className="ghost-btn" onClick={onBack}>
                  <ArrowLeft size={15} aria-hidden="true" />
                  Volver a la tienda
                </button>
              </div>
            ) : (
              <>
                <ul className="ticket-lines">
                  {state.items.map(item => {
                    const agregosPrice = item.agregos?.reduce((sum, agg) => sum + (agg.precio * (agg.cantidad || 1)), 0) || 0
                    const itemTotal = (item.product.precio * item.quantity) + agregosPrice
                    return (
                      <li key={item.product.id} className="ticket-line">
                        <div className="line-main">
                          <span className="line-qty">{item.quantity} ×</span>
                          <span className="line-name">{item.product.nombre}</span>
                          <span className="line-dots" aria-hidden="true" />
                          <span className="line-amount">{formatPrice(itemTotal)}</span>
                        </div>
                        {item.agregos && item.agregos.length > 0 && (
                          <ul className="line-agregos">
                            {item.agregos.map((agrego, idx) => (
                              <li key={idx} className="agrego-line">
                                <span className="agrego-name">
                                  + {agrego.nombre}
                                  {agrego.cantidad && agrego.cantidad > 1 ? ` x${agrego.cantidad}` : ''}
                                </span>
                                <span className="line-dots" aria-hidden="true" />
                                <span className="agrego-amount">
                                  {formatPrice(agrego.precio * (agrego.cantidad || 1))}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    )
                  })}
                </ul>

                <div className="ticket-total">
                  <span className="total-label">Total</span>
                  <span className="total-amount">{formatPrice(state.total)}</span>
                </div>
              </>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}
