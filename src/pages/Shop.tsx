import React, { useState, useEffect } from 'react'
import { ProductCard } from '../components/ProductCard'
import { Product, Agregado } from '../contexts/CartContext'
import { useCart } from '../contexts/CartContext'
import { getProducts } from '../services/products'
import './Shop.css'
import toast from 'react-hot-toast'

export const Shop: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const { addItem } = useCart()

  const categories = ['Crepes', 'Mini Donas', 'Combos de Crepes', 'Combos de Donas', 'Combos Mixtos']

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts()
        const availableProducts = data.filter(p => p.disponible)
        setProducts(availableProducts)
        setFilteredProducts(availableProducts)
      } catch (error) {
        console.error('Error fetching products:', error)
        toast.error('Error al cargar los productos')
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  useEffect(() => {
    let filtered = products

    if (selectedCategory) {
      filtered = filtered.filter(p => p.categoria === selectedCategory)
    }

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredProducts(filtered)
  }, [selectedCategory, searchTerm, products])

  const handleAddToCart = (product: Product, agregos?: Agregado[]) => {
    addItem(product, agregos)
    toast.success(`${product.nombre} agregado al carrito`)
  }

  return (
    <div className="shop">
      <div className="shop-header">
        <h1>Mini NaBi</h1>
      </div>

      <div className="shop-container">
        <aside className="shop-sidebar">
          <div className="filter-section">
            <h3>Buscar</h3>
            <input
              type="text"
              placeholder="Buscar producto..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-section">
            <h3>Categorías</h3>
            <button
              className={`category-btn ${selectedCategory === '' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('')}
            >
              Todos
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </aside>

        <main className="shop-main">
          {loading ? (
            <div className="loading">Cargando productos...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="no-products">No hay productos disponibles</div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}