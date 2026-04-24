import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProducts, Product } from '../services/products'
import { getBlogPosts, BlogPost } from '../services/blog'
import { Logo } from '../components/Logo'
import './Home.css'

export const Home: React.FC = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [latestPost, setLatestPost] = useState<BlogPost | null>(null)
  const [loadingPost, setLoadingPost] = useState(true)

  // ========== CARRUSEL NUEVO ==========
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerView, setItemsPerView] = useState(4)
  const [isDragging, setIsDragging] = useState(false)
  const [startPos, setStartPos] = useState(0)
  const [currentTranslate, setCurrentTranslate] = useState(0)
  const [prevTranslate, setPrevTranslate] = useState(0)
  const [animationId, setAnimationId] = useState<number | null>(null)
  const [autoPlay, setAutoPlay] = useState(true)
  const carouselRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const autoPlayRef = useRef<number | null>(null)

  // Configurar items por vista según ancho
  useEffect(() => {
    const updateItemsPerView = () => {
      const width = window.innerWidth
      if (width < 480) setItemsPerView(2)
      else if (width < 768) setItemsPerView(2)
      else if (width < 1024) setItemsPerView(3)
      else setItemsPerView(4)
    }
    updateItemsPerView()
    window.addEventListener('resize', updateItemsPerView)
    return () => window.removeEventListener('resize', updateItemsPerView)
  }, [])

  // Total de slides (páginas)
  const totalSlides = Math.ceil(products.length / itemsPerView)

  // Función para obtener el ancho de un item (con gap)
  const getItemWidth = () => {
    if (!carouselRef.current) return 0
    const containerWidth = carouselRef.current.clientWidth
    const gap = 24 // el gap entre items (definido en CSS)
    return (containerWidth - (itemsPerView - 1) * gap) / itemsPerView
  }

  // Calcular la traslación en píxeles
  const getTranslateX = () => {
    if (!trackRef.current) return 0
    const itemWidth = getItemWidth()
    const gap = 24
    return -currentIndex * (itemWidth + gap)
  }

  // Actualizar posición del track
  const updateTrackPosition = useCallback(() => {
    if (!trackRef.current) return
    const translateX = getTranslateX()
    trackRef.current.style.transform = `translateX(${translateX}px)`
  }, [currentIndex, itemsPerView, products.length])

  useEffect(() => {
    updateTrackPosition()
  }, [currentIndex, itemsPerView, updateTrackPosition])

  // Auto-play
  useEffect(() => {
    if (autoPlay && totalSlides > 1) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % totalSlides)
      }, 5000)
    }
    return () => clearInterval(autoPlayRef.current)
  }, [autoPlay, totalSlides])

  const pauseAutoPlay = () => setAutoPlay(false)
  const resumeAutoPlay = () => setAutoPlay(true)

  // Navegación manual
  const nextSlide = () => {
    if (totalSlides === 0) return
    setCurrentIndex((prev) => (prev + 1) % totalSlides)
  }
  const prevSlide = () => {
    if (totalSlides === 0) return
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides)
  }

  // ========== DRAG / SWIPE ==========
  const onDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (totalSlides <= 1) return
    pauseAutoPlay()
    setIsDragging(true)
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    setStartPos(clientX)
    setPrevTranslate(getTranslateX())
    setCurrentTranslate(getTranslateX())
    if (animationId) cancelAnimationFrame(animationId)
  }

  const onDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const deltaX = clientX - startPos
    const newTranslate = prevTranslate + deltaX
    setCurrentTranslate(newTranslate)
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(${newTranslate}px)`
    }
  }

  const onDragEnd = () => {
    if (!isDragging) return
    setIsDragging(false)
    const movedBy = currentTranslate - prevTranslate
    const itemWidth = getItemWidth()
    const threshold = itemWidth * 0.2

    if (movedBy < -threshold && currentIndex < totalSlides - 1) {
      setCurrentIndex(currentIndex + 1)
    } else if (movedBy > threshold && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
    updateTrackPosition()
    resumeAutoPlay()
  }

  // Cargar productos
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts(12)
        setProducts(data)
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  // Cargar último post del blog
  useEffect(() => {
    const fetchLatestPost = async () => {
      try {
        const posts = await getBlogPosts()
        if (posts.length > 0) setLatestPost(posts[0])
      } catch (error) {
        console.error('Error fetching latest post:', error)
      } finally {
        setLoadingPost(false)
      }
    }
    fetchLatestPost()
  }, [])

  // ========== RENDER ==========
  return (
    <div className="home">
      <section className="hero" id="inicio">
        <div className="hero-content">
          <div className="hero-logo"><Logo size="large" /></div>
          <h1>Mini Nabi</h1>
          <p>Los mejores dulces artesanales, directamente a tu puerta</p>
          <button className="cta-btn" onClick={() => navigate('/shop')}>Ver Catálogo</button>
        </div>
        <div className="hero-decoration">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
          <div className="blob blob-3"></div>
        </div>
      </section>

      {/* NUEVO CARRUSEL PROFESIONAL */}
      <section className="carousel-section">
        <h2>Nuestros Productos</h2>
        <p className="section-subtitle">Dale un vistazo a nuestra selección</p>

        {!loading && products.length > 0 ? (
          <div 
            className="carousel-container"
            ref={carouselRef}
            onMouseEnter={pauseAutoPlay}
            onMouseLeave={resumeAutoPlay}
          >
            {/* Botones de navegación (solo visibles en desktop) */}
            {totalSlides > 1 && (
              <>
                <button className="carousel-btn prev" onClick={prevSlide} aria-label="Anterior">❮</button>
                <button className="carousel-btn next" onClick={nextSlide} aria-label="Siguiente">❯</button>
              </>
            )}

            <div 
              className="carousel-wrapper"
              onMouseDown={onDragStart}
              onMouseMove={onDragMove}
              onMouseUp={onDragEnd}
              onMouseLeave={onDragEnd}
              onTouchStart={onDragStart}
              onTouchMove={onDragMove}
              onTouchEnd={onDragEnd}
              style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
              <div className="carousel-track" ref={trackRef}>
                {products.map((product) => (
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

            {/* Indicadores (dots) */}
            {totalSlides > 1 && (
              <div className="carousel-dots">
                {Array.from({ length: totalSlides }).map((_, idx) => (
                  <button
                    key={idx}
                    className={`dot ${idx === currentIndex ? 'active' : ''}`}
                    onClick={() => { setCurrentIndex(idx); resumeAutoPlay(); }}
                  />
                ))}
              </div>
            )}
          </div>
        ) : !loading ? (
          <div className="carousel-empty"><p>Próximamente más productos</p></div>
        ) : (
          <div className="carousel-loading">Cargando...</div>
        )}
      </section>

      {/* Resto de secciones (blog, historia, contacto, features) - se mantienen igual */}
      {!loadingPost && latestPost && (
        <section className="latest-blog-section">
          <div className="latest-blog-container">
            <div className="latest-blog-header">
              <span className="latest-blog-tag">Última Publicación</span>
              <h2>Desde Nuestro Blog</h2>
              <p className="section-subtitle">Mantente al día con las novedades de MiniNabi</p>
            </div>
            <div className="latest-blog-card">
              <div className="latest-blog-image">
                <img src={latestPost.image_url} alt={latestPost.title} />
              </div>
              <div className="latest-blog-content">
                <div className="latest-blog-meta">
                  <span className="blog-date">
                    {new Date(latestPost.created_at).toLocaleDateString('es-ES', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </span>
                </div>
                <h3 className="latest-blog-title">{latestPost.title}</h3>
                <p className="latest-blog-description">{latestPost.description}</p>
                <button className="latest-blog-btn" onClick={() => navigate(`/blog/`)}>Leer más</button>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="history-section crepe-section" id="historia">
        <div className="history-content">
          <div className="history-image"><img src="https://vfomcuyjibpbkistjhpd.supabase.co/storage/v1/object/public/pics/HistoriaCrepes.webp?w=600&h=400&fit=crop" alt="Crepes" /></div>
          <div className="history-text">
            <span className="history-tag">Origen</span><h2>Los Crepes</h2>
            <p>El crepe es una receta originaria de Francia que data del siglo XIII. Tradicionalmente preparado con harina de trigo, huevos y leche, este versátil acompañamiento se ha convertido en un canvas perfecto para sabores dulces y salados.</p>
            <p>En MiniNabi, preparamos nuestros crepes con una receta especial que garantiza esa textura suave y flexible perfecta para rellenarlos con tus favoritos.</p>
            <ul className="history-facts"><li>📍 Origen: Francia, siglo XIII</li><li>🥚 Ingredientes: Harina, huevos, leche</li><li>🍽️ Uso: Postre y plato principal</li></ul>
          </div>
        </div>
      </section>

      <section className="history-section minidona-section">
        <div className="history-content reverse">
          <div className="history-text">
            <span className="history-tag">Historia</span><h2>Las MiniDonas</h2>
            <p>Las mini donas (o donut holes) nacieron en Estados Unidos a principios del siglo XX. Originalmente eran los centros cortados de las donas tradicionales, pero rápidamente se convirtieron en un éxito independiente por su tamaño perfecto y textura crujiente.</p>
            <p>En MiniNabi hemos llevado este clásico a un nivel superior con nuestros toppings artesanales y coberturas especiales que las hacen irresistibles.</p>
            <ul className="history-facts"><li>📍 Origen: Estados Unidos, 1910</li><li>🍩 Tamaño: Suaves y pequeñas</li><li>🍫 Coberturas: Chocolate Negro y Chocolate Blanco</li></ul>
          </div>
          <div className="history-image"><img src="https://vfomcuyjibpbkistjhpd.supabase.co/storage/v1/object/public/pics/HistoriaDonas.webp?w=600&h=400&fit=crop" alt="MiniDonas" /></div>
        </div>
      </section>

      <section className="contact-section" id="contacto">
        <div className="contact-container">
          <h2>Información de Contacto</h2><p className="contact-subtitle">Escríbenos o síguenos</p>
          <div className="contact-grid">
            <div className="contact-item"><span className="contact-icon">📲</span><div className="contact-info"><h3>Teléfonos</h3><p>+53 5 5845670</p><p>+53 5 3495645</p></div></div>
            <div className="contact-item"><span className="contact-icon">📸</span><div className="contact-info"><h3>Instagram</h3><a href="https://instagram.com/mini.donitasycrepesnabi" target="_blank" rel="noopener noreferrer" className="contact-link">@mini.donitasycrepesnabi</a></div></div>
            <div className="contact-item"><span className="contact-icon">⏰</span><div className="contact-info"><h3>Atención</h3><p>Solo por encargos con anticipación de 24 a 48 horas</p></div></div>
            <div className="contact-item"><span className="contact-icon">🚚</span><div className="contact-info"><h3>Mensajería</h3><p>Disponible por un costo adicional (consultar al hacer el pedido)</p></div></div>
            <div className="contact-item"><span className="contact-icon">📍</span><div className="contact-info"><h3>Puntos de recogida</h3><p>Miramar • El Cerro</p><span className="free-tag">Sin costo</span></div></div>
            <div className="contact-item"><span className="contact-icon">💰</span><div className="contact-info"><h3>Métodos de pago</h3><p>Efectivo (cup), Transferencia, Dólares</p></div></div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="feature"><div className="feature-icon">🌟</div><h3>Productos Frescos</h3><p>Elaborados con ingredientes de calidad premium</p></div>
        <div className="feature"><div className="feature-icon">🚚</div><h3>Envíos Rápidos</h3><p>Llega a tu casa en el menor tiempo posible</p></div>
        <div className="feature"><div className="feature-icon">💝</div><h3>Empaques Bonitos</h3><p>Perfectos para regalar y sorprender</p></div>
      </section>
    </div>
  )
}