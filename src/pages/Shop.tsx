import React, { useState, useEffect } from 'react'
import { ProductCard } from '../components/ProductCard'
import { Product, Agregado } from '../contexts/CartContext'
import { useCart } from '../contexts/CartContext'
import { getProducts } from '../services/products'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import './Shop.css'
import toast from 'react-hot-toast'

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']

export const Shop: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const { addItem } = useCart()

  const categories = ['Crepes', 'Mini Donas', 'Combos de Crepes', 'Combos de Donas', 'Combos Mixtos']

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getProducts()
        const availableProducts = data.filter(p => p.disponible)
        setProducts(availableProducts)
        setFilteredProducts(availableProducts)
      } catch (error) {
        console.error('Error fetching products:', error)
        setError('No pudimos abrir el cuaderno de recetas.')
        toast.error('Error al cargar los productos')
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [reloadKey])

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

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category)
    setShowMobileFilters(false)
  }

  const chapterOf = (category: string) => {
    const index = categories.indexOf(category)
    return index >= 0 ? ROMAN[index] : ''
  }

  const fichasIn = (category: string) => products.filter(p => p.categoria === category).length

  const pluralFichas = (n: number) => (n === 1 ? 'ficha' : 'fichas')

  const clearFilters = () => {
    setSelectedCategory('')
    setSearchTerm('')
    setShowMobileFilters(false)
  }

  const filtersActive = Boolean(selectedCategory) || Boolean(searchTerm)
  const chapterTitle = selectedCategory
    ? `Capítulo ${chapterOf(selectedCategory)} · ${selectedCategory}`
    : 'Todas las fichas'

  return (
    <div className="shop">
      <header className="shop-header">
        <div className="shop-header-inner">
          <div className="shop-title-block">
            <h1>La tienda del cuaderno</h1>
            <p className="shop-standfirst">
              Índice de la casa: cada capítulo es una categoría y cada ficha, una receta
              con su lista de agregos y su ticket de precio pegado.
            </p>
          </div>
          <p className="shop-folio">
            {loading
              ? 'abriendo el cuaderno…'
              : `${categories.length} capítulos · ${error ? '—' : `${products.length} ${pluralFichas(products.length)}`}`}
          </p>
        </div>
      </header>

      <div className="shop-container">
        {/* Mobile Filter Toggle Button - Hidden when sidebar is open */}
        <button
          type="button"
          className={showMobileFilters ? "mobile-filter-btn hidden" : "mobile-filter-btn"}
          onClick={() => setShowMobileFilters(true)}
        >
          <SlidersHorizontal size={16} strokeWidth={1.75} aria-hidden="true" />
          Mostrar filtros
        </button>

        <aside className={`shop-sidebar ${showMobileFilters ? 'mobile-visible' : ''}`}>
          {/* Mobile close button inside sidebar */}
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={() => setShowMobileFilters(false)}
            aria-label="Cerrar los filtros"
          >
            <X size={20} strokeWidth={1.75} aria-hidden="true" />
          </button>

          <section className="filter-section">
            <h2 className="filter-title">Buscar en el cuaderno</h2>
            <div className="search-field">
              <Search size={16} strokeWidth={1.75} aria-hidden="true" />
              <input
                type="text"
                placeholder="Nombre o descripción"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="search-input"
                aria-label="Buscar en el cuaderno"
              />
            </div>
          </section>

          <section className="filter-section">
            <h2 className="filter-title">Capítulos</h2>
            <ul className="chapter-index">
              <li>
                <button
                  type="button"
                  className={`chapter-btn ${selectedCategory === '' ? 'active' : ''}`}
                  onClick={() => handleCategorySelect('')}
                  aria-pressed={selectedCategory === ''}
                >
                  <span className="chapter-num" aria-hidden="true">—</span>
                  <span className="chapter-name">Todas las fichas</span>
                  <span className="chapter-leader" aria-hidden="true" />
                  <span className="chapter-count">
                    {products.length}
                    <span className="sr-only"> {pluralFichas(products.length)}</span>
                  </span>
                </button>
              </li>
              {categories.map((cat, i) => (
                <li key={cat}>
                  <button
                    type="button"
                    className={`chapter-btn ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => handleCategorySelect(cat)}
                    aria-pressed={selectedCategory === cat}
                  >
                    <span className="sr-only">Capítulo </span>
                    <span className="chapter-num" aria-hidden="true">{ROMAN[i]}</span>
                    <span className="chapter-name">{cat}</span>
                    <span className="chapter-leader" aria-hidden="true" />
                    <span className="chapter-count">
                      {fichasIn(cat)}
                      <span className="sr-only"> {pluralFichas(fichasIn(cat))}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </aside>

        <main className="shop-main">
          {!loading && !error && filteredProducts.length > 0 && (
            <div className="chapter-head">
              <h2>{chapterTitle}</h2>
              <div className="chapter-meta">
                <span className="chapter-total">
                  <b>{filteredProducts.length}</b> {pluralFichas(filteredProducts.length)}
                </span>
                {searchTerm && (
                  <span className="chapter-query">para «{searchTerm}»</span>
                )}
                {filtersActive && (
                  <button type="button" className="chapter-clear" onClick={clearFilters}>
                    <X size={14} strokeWidth={2} aria-hidden="true" />
                    Índice completo
                  </button>
                )}
              </div>
            </div>
          )}

          {loading ? (
            <div className="shop-loading" role="status">
              <span className="sr-only">Cargando las fichas del cuaderno…</span>
              {[0, 1, 2].map(n => (
                <div className="ficha-skeleton" key={n} aria-hidden="true">
                  <span className="sk-photo" />
                  <span className="sk-line sk-w70" />
                  <span className="sk-line sk-w40" />
                  <span className="sk-block" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="shop-state" role="alert">
              <h2 className="state-title">No se pudo abrir el cuaderno</h2>
              <p className="state-body">
                Falló la carga de las fichas. Revisa la conexión y vuelve a intentarlo.
              </p>
              <button type="button" className="state-action" onClick={() => setReloadKey(k => k + 1)}>
                Volver a cargar
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="shop-state" role="status">
              <h2 className="state-stamp">Sin resultados</h2>
              <p className="state-body">
                {searchTerm
                  ? `No hay ninguna ficha anotada para «${searchTerm}».`
                  : 'Este capítulo todavía no tiene fichas anotadas.'}
                {' '}Vuelve al índice completo para seguir hojando las recetas.
              </p>
              <button type="button" className="state-action" onClick={clearFilters}>
                Ver todo el cuaderno
              </button>
            </div>
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
