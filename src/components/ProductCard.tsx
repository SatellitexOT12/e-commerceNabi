import React, { useState, useEffect } from 'react'
import './ProductCard.css'
import { Product, Agregado } from '../contexts/CartContext'
import { getAgregos } from '../services/agregos'
import { formatPrice } from '../utils/formatPrice'

interface SelectedAgrego extends Agregado {
  cantidad: number
}

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product, agregos?: Agregado[]) => void
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const [agregos, setAgregos] = useState<Agregado[]>([])
  const [selectedAgregos, setSelectedAgregos] = useState<Record<string, number>>({})
  const [showAgregos, setShowAgregos] = useState(false)
  const [loading, setLoading] = useState(true)

  const needsAgregos = product.categoria === 'Crepes' || product.categoria === 'Combos de Crepes' || product.categoria === 'Combos Mixtos' || product.categoria?.includes('Crepe')

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
      <div className="product-card agregos-modal">
        <div className="agregos-header">
          <h3>Selecciona agregos</h3>
          <button className="close-btn" onClick={() => setShowAgregos(false)}>×</button>
        </div>
        <p className="agregos-subtitle">para {product.nombre}</p>
        
        {loading ? (
          <div className="loading">Cargando agregos...</div>
        ) : agregos.length === 0 ? (
          <div className="no-agregos">No hay agregos disponibles</div>
        ) : (
          <div className="agregos-list">
            {agregos.map(agg => {
              const cantidad = selectedAgregos[agg.id] || 0
              return (
                 <div key={agg.id} className="agregos-item">
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
                    >
                      -
                    </button>
                    <span className="qty-value">{cantidad}</span>
                    <button 
                      type="button"
                      className="qty-btn"
                      onClick={() => updateCantidad(agg.id, 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        
         <div className="agregos-footer">
           <span className="total-price">Total: {formatPrice(totalPrice)}</span>
           <button 
             className="add-btn" 
             onClick={handleConfirm}
             disabled={!product.disponible}
           >
             Agregar
           </button>
         </div>
      </div>
    )
  }

  return (
    <div className="product-card">
      <div className="product-image">
        <img src={product.imagen_url} alt={product.nombre} />
      </div>
      <div className="product-info">
        <h3>{product.nombre}</h3>
        <p className="category">{product.categoria}</p>
        <p className="description">{product.descripcion}</p>
        <div className="product-footer">
          <span className="price">{formatPrice(product.precio)}</span>
          <button 
            onClick={handleAdd} 
            className="add-btn"
            disabled={!product.disponible}
          >
            {product.disponible ? 'Agregar' : 'No disponible'}
          </button>
        </div>
      </div>
    </div>
  )
}