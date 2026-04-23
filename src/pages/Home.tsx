import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProducts, Product } from '../services/products'
import './Home.css'

export const Home: React.FC = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loading, setLoading] = useState(true)
  const [itemsPerView, setItemsPerView] = useState(4)

  // Detectar items por vista basado en el ancho de la pantalla
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      if (width < 480) {
        setItemsPerView(2)
      } else if (width < 768) {
        setItemsPerView(2)
      } else if (width < 1024) {
        setItemsPerView(3)
      } else {
        setItemsPerView(4)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts()
        setProducts(data)
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const totalSlides = Math.ceil(products.length / itemsPerView)

  useEffect(() => {
    if (products.length <= itemsPerView) return
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % totalSlides)
    }, 5000)
    return () => clearInterval(interval)
  }, [products.length, itemsPerView, totalSlides])

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % totalSlides)
  }

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + totalSlides) % totalSlides)
  }

  const translatePercentage = (100 / itemsPerView) * currentSlide

  return (
    <div className="home">
      <section className="hero" id="inicio">
        <div className="hero-content">
          <h1>🍰 MiniNabi</h1>
          <p>Los mejores dulces artesanales, directamente a tu puerta</p>
          <button className="cta-btn" onClick={() => navigate('/shop')}>
            Ver Catálogo
          </button>
        </div>
        <div className="hero-decoration">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
          <div className="blob blob-3"></div>
        </div>
      </section>

      <section className="carousel-section">
        <h2>Nuestros Productos</h2>
        <p className="section-subtitle">Dale un vistazo a nuestra selección</p>
        
        {!loading && products.length > 0 ? (
          <div className="carousel-container">
            <button className="carousel-btn prev" onClick={prevSlide}>❮</button>
            <div className="carousel-wrapper">
              <div 
                className="carousel-track"
                style={{ transform: `translateX(-${translatePercentage}%)` }}
              >
                {products.map(product => (
                  <div key={product.id} className="carousel-item" onClick={() => navigate('/shop')}>
                    <div className="carousel-image">
                      <img src={product.imagen_url} alt={product.nombre} />
                    </div>
                    <div className="carousel-info">
                      <h3>{product.nombre}</h3>
                       <p className="carousel-price">${product.precio.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button className="carousel-btn next" onClick={nextSlide}>❯</button>
          </div>
        ) : !loading ? (
          <div className="carousel-empty">
            <p>Próximamente más productos</p>
          </div>
        ) : (
          <div className="carousel-loading">Cargando...</div>
        )}
        
        <div className="carousel-dots">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </section>

      <section className="history-section crepe-section" id="historia">
        <div className="history-content">
          <div className="history-image">
            <img src="https://vfomcuyjibpbkistjhpd.supabase.co/storage/v1/object/public/pics/HistoriaCrepes.webp?w=600&h=400&fit=crop" alt="Crepes" />
          </div>
          <div className="history-text">
            <span className="history-tag">Origen</span>
            <h2>Los Crepes</h2>
            <p>
              El crepe es una recetas originaria de Francia que datea del siglo XIII. 
              Tradicionalmente preparado con harina de trigo, huevos y leche, este versátil 
              acompañamiento se ha convertido en uncanvas perfecto para sabores dulces y salados.
            </p>
            <p>
              En MiniNabi, preparamos nuestros crepes con una receta especial que garantiza 
              esa textura suave y flexible perfecta para rellenarlos con tus favoritos.
            </p>
            <ul className="history-facts">
              <li>📍 Origen: Francia, siglo XIII</li>
              <li>🥚 Ingredientes: Harina, huevos, leche</li>
              <li>🍽️ Uso: Postre y plato principal</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="history-section minidona-section">
        <div className="history-content reverse">
          <div className="history-text">
            <span className="history-tag">Historia</span>
            <h2>Las MiniDonas</h2>
            <p>
              Las mini donas (o donut holes) nacieron en Estados Unidos a principios del siglo XX. 
              Originalmente eran los centros cortada de las donas tradicionales, pero rápidamente se convirtieron 
              en un éxito independiente por su tamaño perfecto y textura crujiente.
            </p>
            <p>
              En MiniNabi hemos levado esta clásico a un nivel superior con nuestros toppings artesanales 
              y coberturas especiales que las hacen irresistibles.
            </p>
            <ul className="history-facts">
              <li>📍 Origen: Estados Unidos, 1910</li>
              <li>🍩 Tamaño: Suaves y pequeñas</li>
              <li>🍫 Coberturas: Chocolate Negro y Chocolate Blanco</li>
            </ul>
          </div>
          <div className="history-image">
            <img src="https://vfomcuyjibpbkistjhpd.supabase.co/storage/v1/object/public/pics/HistoriaDonas.webp?w=600&h=400&fit=crop" alt="MiniDonas" />
          </div>
        </div>
      </section>

      <section className="contact-section" id="contacto">
        <div className="contact-container">
          <h2>Información de Contacto</h2>
          <p className="contact-subtitle">Escríbenos o síguenos</p>
          
          <div className="contact-grid">
            <div className="contact-item">
              <span className="contact-icon">📲</span>
              <div className="contact-info">
                <h3>Teléfonos</h3>
                <p>+53 5 5845670</p>
                <p>+53 5 3495645</p>
              </div>
            </div>
            
            <div className="contact-item">
              <span className="contact-icon">📸</span>
              <div className="contact-info">
                <h3>Instagram</h3>
                <a 
                  href="https://instagram.com/mini.donitasycrepesnabi" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="contact-link"
                >
                  @mini.donitasycrepesnabi
                </a>
              </div>
            </div>
            
            <div className="contact-item">
              <span className="contact-icon">⏰</span>
              <div className="contact-info">
                <h3>Atención</h3>
                <p>Solo por encargos con anticipación de 24 a 48 horas</p>
              </div>
            </div>
            
            <div className="contact-item">
              <span className="contact-icon">🚚</span>
              <div className="contact-info">
                <h3>Mensajería</h3>
                <p>Disponible por un costo adicional (consultar al hacer el pedido)</p>
              </div>
            </div>
            
            <div className="contact-item">
              <span className="contact-icon">📍</span>
              <div className="contact-info">
                <h3>Puntos de recogida</h3>
                <p>Miramar • El Cerro</p>
                <span className="free-tag">Sin costo</span>
              </div>
            </div>
            
            <div className="contact-item">
              <span className="contact-icon">💰</span>
              <div className="contact-info">
                <h3>Métodos de pago</h3>
                <p>Efectivo (cup), Transferencia, Dólares</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="feature">
          <div className="feature-icon">🌟</div>
          <h3>Productos Frescos</h3>
          <p>Elaborados con ingredientes de calidad premium</p>
        </div>
        <div className="feature">
          <div className="feature-icon">🚚</div>
          <h3>Envíos Rápidos</h3>
          <p>Llega a tu casa en el menor tiempo posible</p>
        </div>
        <div className="feature">
          <div className="feature-icon">💝</div>
          <h3>Empaques Bonitos</h3>
          <p>Perfectos para regalar y sorprender</p>
        </div>
      </section>
    </div>
  )
}