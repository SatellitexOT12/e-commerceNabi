import React, { useState, useEffect, useRef } from 'react'
import './ProductCard.css'
import { Product, Agregado } from '../contexts/CartContext'
import { getAgregos } from '../services/agregos'
import { formatPrice } from '../utils/formatPrice'
import { ChevronDown, Minus, Plus, Search, X } from 'lucide-react'

interface SelectedAgrego extends Agregado {
  cantidad: number
}

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product, agregos?: Agregado[]) => void
}

const DESC_MAX_LENGTH = 80

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const [agregos, setAgregos] = useState<Agregado[]>([])
  const [selectedAgregos, setSelectedAgregos] = useState<Record<string, number>>({})
  const [showAgregos, setShowAgregos] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showLightbox, setShowLightbox] = useState(false)
  const [descExpanded, setDescExpanded] = useState(false)

  const needsAgregos = product.categoria === 'Crepes' || product.categoria === 'Combos de Crepes' || product.categoria === 'Combos Mixtos' || product.categoria?.includes('Crepe')

  const isDescLong = product.descripcion && product.descripcion.length > DESC_MAX_LENGTH

  useEffect(() => {
    const fetchAgregos = async () => {
      try {
        const data = await getAgregos()
        setAgregos(data)
      } catch (error) {
        console.error('Error fetching agregos:', error)
      } finally {
        setLoading(false)
      }
    }

    if (needsAgregos) {
      fetchAgregos()
    } else {
      setLoading(false)
    }
  }, [needsAgregos])

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (showLightbox) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [showLightbox])

  // Escape closes the image viewer
  useEffect(() => {
    if (!showLightbox) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowLightbox(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [showLightbox])

  const updateCantidad = (aggId: string, delta: number) => {
    setSelectedAgregos(prev => {
      const current = prev[aggId] || 0
      const newCantidad = Math.max(0, current + delta)
      if (newCantidad === 0) {
        const { [aggId]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [aggId]: newCantidad }
    })
  }

  const handleAdd = () => {
    if (needsAgregos) {
      setShowAgregos(true)
    } else {
      // For products like Mini Donas, no manual agrego selection, just pass undefined
      onAddToCart(product)
    }
  }

  const handleConfirm = () => {
    const agregosToAdd: Agregado[] = Object.entries(selectedAgregos).map(([id, cantidad]) => {
      const agg = agregos.find(a => a.id === id)!
      return { ...agg, cantidad } as Agregado
    })
    onAddToCart(product, agregosToAdd)
    setSelectedAgregos({})
    setShowAgregos(false)
  }

  const agregosTotal = Object.entries(selectedAgregos).reduce((sum, [id, cantidad]) => {
    const agg = agregos.find(a => a.id === id)
    return sum + (agg ? agg.precio * cantidad : 0)
  }, 0)
  const totalPrice = product.precio + agregosTotal

  if (showAgregos) {
    return (
      <div
        className="product-card agregos-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`Agregos para ${product.nombre}`}
      >
        <span className="card-tape agregos-tape" aria-hidden="true" />
        <div className="agregos-header">
          <h3>Los agregos de la receta</h3>
          <button
            type="button"
            className="close-btn"
            onClick={() => setShowAgregos(false)}
            aria-label="Cerrar la lista de agregos"
          >
            <X size={20} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>
        <p className="agregos-subtitle">para {product.nombre}</p>

        {loading ? (
          <div className="agregos-state" role="status">Cargando la lista de ingredientes…</div>
        ) : agregos.length === 0 ? (
          <div className="agregos-state">Esta receta no tiene agregos disponibles</div>
        ) : (
          <ul className="agregos-list">
            {agregos.map(agg => {
              const cantidad = selectedAgregos[agg.id] || 0
              return (
                <li key={agg.id} className="agregos-item">
                  <div className="agg-info">
                    <span className="agg-nombre">{agg.nombre}</span>
                    <span className="agg-precio">+{formatPrice(agg.precio)} c/u</span>
                  </div>
                  <div className="agg-cantidad">
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => updateCantidad(agg.id, -1)}
                      disabled={cantidad === 0}
                      aria-label={`Quitar ${agg.nombre}`}
                    >
                      <Minus size={16} strokeWidth={2} aria-hidden="true" />
                    </button>
                    <span className="qty-value" aria-label={`Cantidad de ${agg.nombre}`}>{cantidad}</span>
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => updateCantidad(agg.id, 1)}
                      aria-label={`Agregar ${agg.nombre}`}
                    >
                      <Plus size={16} strokeWidth={2} aria-hidden="true" />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        <div className="agregos-footer">
          <span className="total-price" aria-live="polite">
            <span className="total-label">Total</span>
            <span className="total-amount">{formatPrice(totalPrice)}</span>
          </span>
          <button
            type="button"
            className="add-btn"
            onClick={handleConfirm}
            disabled={!product.disponible}
          >
            Anotar en el pedido
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <article className="product-card">
        <span className="card-tape" aria-hidden="true" />

        <button
          type="button"
          className="product-image"
          onClick={() => setShowLightbox(true)}
          aria-label={`Ver la foto de ${product.nombre} en grande`}
        >
          <img src={product.imagen_url} alt={product.nombre} loading="lazy" />
          <span className="image-zoom-hint" aria-hidden="true">
            <Search size={16} strokeWidth={1.75} />
          </span>
        </button>

        <div className="product-info">
          <h3>{product.nombre}</h3>
          <p className="category">{product.categoria}</p>
          <div className="description-wrapper">
            {isDescLong ? (
              <>
                <p className={`description ${descExpanded ? 'description--expanded' : ''}`}>
                  {descExpanded ? product.descripcion : `${product.descripcion.substring(0, DESC_MAX_LENGTH)}...`}
                </p>
                <button
                  type="button"
                  className="read-more-btn"
                  onClick={() => setDescExpanded(!descExpanded)}
                  aria-expanded={descExpanded}
                >
                  {descExpanded ? 'Leer menos' : 'Leer más'}
                  <ChevronDown size={14} strokeWidth={2} aria-hidden="true" />
                </button>
              </>
            ) : (
              <p className="description">{product.descripcion}</p>
            )}
          </div>

          <div className="product-footer">
            <div className="price-ticket">
              <span className="ticket-label">Precio</span>
              <span className="price">{formatPrice(product.precio)}</span>
            </div>
            <button
              type="button"
              onClick={handleAdd}
              className="add-btn"
              disabled={!product.disponible}
            >
              {product.disponible ? (needsAgregos ? 'Elegir agregos' : 'Anotar') : 'No disponible'}
            </button>
          </div>
        </div>
      </article>

      {/* Image Lightbox */}
      {showLightbox && (
        <div
          className="lightbox-overlay"
          onClick={() => setShowLightbox(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`Foto de ${product.nombre}`}
        >
          <button
            type="button"
            className="lightbox-close"
            onClick={() => setShowLightbox(false)}
            aria-label="Cerrar la foto"
            autoFocus
          >
            <X size={22} strokeWidth={1.75} aria-hidden="true" />
          </button>
          <figure className="lightbox-content" onClick={e => e.stopPropagation()}>
            <span className="card-tape lightbox-tape" aria-hidden="true" />
            <img src={product.imagen_url} alt={product.nombre} />
            <figcaption className="lightbox-caption">
              <span className="lightbox-name">{product.nombre}</span>
              <span className="price">{formatPrice(product.precio)}</span>
            </figcaption>
          </figure>
        </div>
      )}
    </>
  )
}
