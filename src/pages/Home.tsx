import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProducts, Product } from '../services/products'
import { getBlogPosts, BlogPost } from '../services/blog'
import { Logo } from '../components/Logo'
import { formatPrice } from '../utils/formatPrice'
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock,
  Gift,
  Instagram,
  Leaf,
  MapPin,
  MessageSquare,
  Phone,
  Truck,
  Wallet,
} from 'lucide-react'
import './Home.css'

// Desplazamiento a una entrada del cuaderno (mismo patrón que usa el Header)
const scrollToId = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// Categorías reales del catálogo (las mismas que filtra la tienda) -> capítulo del cuaderno
const CAPITULOS = [
  { categoria: 'Crepes', capitulo: 'Los Crepes', destino: 'historia' },
  { categoria: 'Mini Donas', capitulo: 'Las MiniDonas', destino: 'minidonas' },
  { categoria: 'Combos de Crepes', capitulo: 'Los Crepes', destino: 'historia' },
  { categoria: 'Combos de Donas', capitulo: 'Las MiniDonas', destino: 'minidonas' },
  { categoria: 'Combos Mixtos', capitulo: 'Los Crepes y las MiniDonas', destino: 'historia' },
]

const fechaLarga = (iso: string) =>
  new Date(iso).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })

// Esquineros de foto: cuatro triángulos de cartulina sobre las esquinas
const Esquineros = () => (
  <>
    <span className="corner corner-tl" aria-hidden="true" />
    <span className="corner corner-tr" aria-hidden="true" />
    <span className="corner corner-bl" aria-hidden="true" />
    <span className="corner corner-br" aria-hidden="true" />
  </>
)

export const Home: React.FC = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [productsError, setProductsError] = useState(false)
  const [latestPost, setLatestPost] = useState<BlogPost | null>(null)
  const [olderPosts, setOlderPosts] = useState<BlogPost[]>([])
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
      // Misma métrica y mismos límites que los @media del CSS: si difieren,
      // el paso calculado y el ancho real de la ficha no coinciden y el
      // carrusel arrastra las tarjetas desalineadas.
      const width = document.documentElement.clientWidth
      if (width <= 768) setItemsPerView(2)
      else if (width <= 1024) setItemsPerView(3)
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
  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setProductsError(false)
    try {
      const data = await getProducts(12)
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
      setProductsError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Cargar entradas del blog (la más reciente y las anteriores)
  useEffect(() => {
    const fetchLatestPost = async () => {
      try {
        const posts = await getBlogPosts()
        if (posts.length > 0) {
          setLatestPost(posts[0])
          setOlderPosts(posts.slice(1, 3))
        }
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
      {/* Portada del cuaderno */}
      <section className="cover" id="inicio">
        <div className="cover-inner">
          <div className="cover-text">
            <h1 className="cover-title">Mini Nabi</h1>
            <p className="cover-lead">Los mejores dulces artesanales, directamente a tu puerta</p>
            <p className="cover-data data">
              Miramar • El Cerro · +53 5 5845670 · @mini.donitasycrepesnabi
            </p>
            <button className="ticket-cta" onClick={() => navigate('/shop')}>
              <span className="cta-label">Ver la tienda</span>
              <span className="cta-stub" aria-hidden="true">
                <ArrowRight size={18} strokeWidth={1.75} />
              </span>
            </button>
          </div>

          <figure className="cover-plate">
            <span className="tape tape-a" aria-hidden="true" />
            <span className="tape tape-b" aria-hidden="true" />
            <div className="plate">
              <div className="plate-window">
                <img
                  src="https://vfomcuyjibpbkistjhpd.supabase.co/storage/v1/object/public/pics/HistoriaCrepes.webp?w=600&h=400&fit=crop"
                  alt="Crepes"
                />
                <Esquineros />
              </div>
            </div>
          </figure>
        </div>
      </section>

      {/* Índice de capítulos */}
      <section className="index-band" aria-labelledby="indice-title">
        <div className="index-inner">
          <div className="index-head">
            <h2 id="indice-title">Índice de capítulos</h2>
            <p className="index-note">cada receta guarda su capítulo</p>
          </div>
          <ul className="index-list">
            {CAPITULOS.map((row) => (
              <li key={row.categoria}>
                <button className="index-row" onClick={() => scrollToId(row.destino)}>
                  <span className="index-casilla" aria-hidden="true" />
                  <span className="index-cat">{row.categoria}</span>
                  <span className="index-leader" aria-hidden="true" />
                  <span className="index-chapter">{row.capitulo}</span>
                  <ArrowRight className="index-arrow" size={16} strokeWidth={1.75} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Mesa de productos (carrusel con autoplay y arrastre) */}
      <section className="carousel-section" id="productos">
        <div className="carousel-inner">
          <div className="section-head">
            <h2>Nuestros Productos</h2>
            <p className="section-subtitle">Dale un vistazo a nuestra selección</p>
          </div>

          {loading ? (
            <div className="carousel-loading" role="status">Cargando productos…</div>
          ) : productsError ? (
            <div className="carousel-error" role="alert">
              <p>No pudimos cargar los productos del cuaderno.</p>
              <button className="retry-btn" onClick={fetchProducts}>Reintentar</button>
            </div>
          ) : products.length > 0 ? (
            <div className="carousel-stage">
              <div
                className="carousel-container"
                ref={carouselRef}
                onMouseEnter={pauseAutoPlay}
                onMouseLeave={resumeAutoPlay}
              >
                {/* Botones de navegación (solo visibles en desktop) */}
                {totalSlides > 1 && (
                  <>
                    <button className="carousel-btn prev" onClick={prevSlide} aria-label="Anterior">
                      <ChevronLeft size={20} strokeWidth={1.75} aria-hidden="true" />
                    </button>
                    <button className="carousel-btn next" onClick={nextSlide} aria-label="Siguiente">
                      <ChevronRight size={20} strokeWidth={1.75} aria-hidden="true" />
                    </button>
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
                      <div
                        key={product.id}
                        className="carousel-item"
                        onClick={() => navigate('/shop')}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            navigate('/shop')
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        aria-label={`Ver ${product.nombre} - ${formatPrice(product.precio)}`}
                      >
                        <div className="carousel-image">
                          <img src={product.imagen_url} alt={product.nombre} />
                        </div>
                        <div className="carousel-info">
                          <h3>{product.nombre}</h3>
                          <p className="carousel-price">{formatPrice(product.precio)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Indicadores (dashes de regla) */}
                {totalSlides > 1 && (
                  <div className="carousel-dots">
                    {Array.from({ length: totalSlides }).map((_, idx) => (
                      <button
                        key={idx}
                        className={`dot ${idx === currentIndex ? 'active' : ''}`}
                        onClick={() => { setCurrentIndex(idx); resumeAutoPlay(); }}
                        aria-label={`Página ${idx + 1} de ${totalSlides}`}
                        aria-current={idx === currentIndex ? 'true' : undefined}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="carousel-empty" role="status">Próximamente más productos</div>
          )}
        </div>
      </section>

      {/* Entradas del blog */}
      {!loadingPost && latestPost && (
        <section className="blog-sheet">
          <div className="blog-inner">
            <div className="section-head">
              <h2>Desde Nuestro Blog</h2>
              <p className="section-subtitle">Mantente al día con las novedades de MiniNabi</p>
            </div>

            <article className="blog-entry">
              <div className="blog-entry-photo">
                <div className="plate">
                  <div className="plate-window">
                    <img src={latestPost.image_url} alt={latestPost.title} />
                    <Esquineros />
                  </div>
                </div>
              </div>

              <div className="blog-entry-body">
                <p className="blog-dateline data">
                  {fechaLarga(latestPost.created_at)}
                  <span className="blog-dateline-label">Última Publicación</span>
                </p>
                <h3 className="latest-blog-title">{latestPost.title}</h3>
                <p className="latest-blog-description">{latestPost.description}</p>
                <button className="ticket-cta ticket-cta-small" onClick={() => navigate(`/blog/`)}>
                  <span className="cta-label">Leer más</span>
                  <span className="cta-stub" aria-hidden="true">
                    <ArrowRight size={16} strokeWidth={1.75} />
                  </span>
                </button>
              </div>
            </article>

            {olderPosts.length > 0 && (
              <ul className="blog-older">
                {olderPosts.map((post) => (
                  <li key={post.id}>
                    <button className="blog-older-row" onClick={() => navigate(`/blog/`)}>
                      <span className="blog-older-date data">{fechaLarga(post.created_at)}</span>
                      <span className="blog-older-title">{post.title}</span>
                      <ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {/* Historia: entradas fechadas del cuaderno */}
      <section className="entry" id="historia">
        <div className="entry-inner">
          <figure className="entry-figure">
            <div className="plate">
              <div className="plate-window">
                <img
                  src="https://vfomcuyjibpbkistjhpd.supabase.co/storage/v1/object/public/pics/HistoriaCrepes.webp?w=600&h=400&fit=crop"
                  alt="Crepes"
                />
                <Esquineros />
              </div>
            </div>
            <figcaption className="plate-note">rellenos a tu gusto</figcaption>
          </figure>

          <div className="entry-text">
            <p className="entry-date data">Francia · siglo XIII</p>
            <h2>Los Crepes</h2>
            <p>
              El crepe es una receta originaria de Francia que data del{' '}
              <span className="data">siglo XIII</span>. Tradicionalmente preparado con harina de
              trigo, huevos y leche, este versátil acompañamiento se ha convertido en un canvas
              perfecto para sabores dulces y salados.
            </p>
            <p>
              En MiniNabi, preparamos nuestros crepes con una receta especial que garantiza esa
              textura suave y flexible perfecta para rellenarlos con tus favoritos.
            </p>
            <dl className="entry-facts">
              <div className="fact">
                <dt>Ingredientes</dt>
                <dd>Harina, huevos, leche</dd>
              </div>
              <div className="fact">
                <dt>Uso</dt>
                <dd>Postre y plato principal</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="entry entry-reverse" id="minidonas">
        <div className="entry-inner">
          <figure className="entry-figure">
            <div className="plate">
              <div className="plate-window">
                <img
                  src="https://vfomcuyjibpbkistjhpd.supabase.co/storage/v1/object/public/pics/HistoriaDonas.webp?w=600&h=400&fit=crop"
                  alt="MiniDonas"
                />
                <Esquineros />
              </div>
            </div>
            <figcaption className="plate-note">tamaño perfecto</figcaption>
          </figure>

          <div className="entry-text">
            <p className="entry-date data">Estados Unidos · 1910</p>
            <h2>Las MiniDonas</h2>
            <p>
              Las mini donas (o donut holes) nacieron en Estados Unidos a principios del{' '}
              <span className="data">siglo XX</span>. Originalmente eran los centros cortados de las
              donas tradicionales, pero rápidamente se convirtieron en un éxito independiente por su
              tamaño perfecto y textura crujiente.
            </p>
            <p>
              En MiniNabi hemos llevado este clásico a un nivel superior con nuestros toppings
              artesanales y coberturas especiales que las hacen irresistibles.
            </p>
            <dl className="entry-facts">
              <div className="fact">
                <dt>Tamaño</dt>
                <dd>Suaves y pequeñas</dd>
              </div>
              <div className="fact">
                <dt>Coberturas</dt>
                <dd>Chocolate Negro y Chocolate Blanco</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="entry" id="hotcakes">
        <div className="entry-inner">
          <figure className="entry-figure">
            <div className="plate">
              <div className="plate-window">
                <img
                  src="https://vfomcuyjibpbkistjhpd.supabase.co/storage/v1/object/public/pics/hotcakesPrincipal.webp"
                  alt="Hotcakes MiniNabi"
                />
                <Esquineros />
              </div>
            </div>
            <figcaption className="plate-note">el desayuno icónico</figcaption>
          </figure>

          <div className="entry-text">
            <p className="entry-date data">De Grecia clásica a Estados Unidos · siglo XIX</p>
            <h2>Hotcakes MiniNabi</h2>
            <p>
              Los hotcakes tienen un origen muy antiguo: ya en la Antigua Grecia se preparaban
              tortas dulces con harina, miel y leche. Con el tiempo, la receta viajó a Europa medieval
              y luego a América, donde se transformó en el desayuno icónico de Estados Unidos gracias
              a mezclas comerciales como Aunt Jemima <span className="data">(1889)</span> y Bisquick{' '}
              <span className="data">(1930)</span>.
            </p>
            <p>
              En MiniNabi hemos llevado este clásico a un nivel superior con presentaciones
              irresistibles, toppings artesanales y combinaciones que parecen sacadas de película.
            </p>
            <dl className="entry-facts">
              <div className="fact">
                <dt>Tamaño</dt>
                <dd>Esponjosos y suaves</dd>
              </div>
              <div className="fact">
                <dt>Coberturas</dt>
                <dd>Miel, sirope de chocolate y frutas frescas</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Ficha de contacto del cuaderno */}
      <section className="contact-section" id="contacto">
        <div className="contact-sheet">
          <div className="sheet-head">
            <Logo size="small" />
            <div className="sheet-title">
              <h2>Información de Contacto</h2>
              <p className="sheet-sub">Escríbenos o síguenos</p>
            </div>
            <span className="stamp" aria-hidden="true">Mini Nabi · La Habana</span>
          </div>

          <dl className="sheet-rows">
            <div className="sheet-row">
              <dt>
                <span className="sheet-mark" aria-hidden="true"><Phone size={15} strokeWidth={1.75} /></span>
                Teléfonos
              </dt>
              <dd className="data">+53 5 5845670<br />+53 5 3495645</dd>
            </div>

            <div className="sheet-row">
              <dt>
                <span className="sheet-mark" aria-hidden="true"><Instagram size={15} strokeWidth={1.75} /></span>
                Instagram
              </dt>
              <dd>
                <a
                  href="https://instagram.com/mini.donitasycrepesnabi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-link"
                >
                  @mini.donitasycrepesnabi
                </a>
              </dd>
            </div>

            <div className="sheet-row">
              <dt>
                <span className="sheet-mark" aria-hidden="true"><Clock size={15} strokeWidth={1.75} /></span>
                Atención
              </dt>
              <dd>Solo por encargos con anticipación de <span className="data">24 a 48 horas</span></dd>
            </div>

            <div className="sheet-row">
              <dt>
                <span className="sheet-mark" aria-hidden="true"><MessageSquare size={15} strokeWidth={1.75} /></span>
                Mensajería
              </dt>
              <dd>Disponible por un costo adicional (consultar al hacer el pedido)</dd>
            </div>

            <div className="sheet-row">
              <dt>
                <span className="sheet-mark" aria-hidden="true"><MapPin size={15} strokeWidth={1.75} /></span>
                Puntos de recogida
              </dt>
              <dd>
                Miramar • El Cerro <span className="free-tag">Sin costo</span>
              </dd>
            </div>

            <div className="sheet-row">
              <dt>
                <span className="sheet-mark" aria-hidden="true"><Wallet size={15} strokeWidth={1.75} /></span>
                Métodos de pago
              </dt>
              <dd>Efectivo (cup), Transferencia, Dólares</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Línea de datos al cierre */}
      <div className="promise-line">
        <ul className="promise-inner">
          <li className="promise-item">
            <Leaf size={16} strokeWidth={1.75} aria-hidden="true" />
            <span className="promise-name">Productos Frescos</span>
            <span className="promise-desc">Elaborados con ingredientes de calidad premium</span>
          </li>
          <li className="promise-item">
            <Truck size={16} strokeWidth={1.75} aria-hidden="true" />
            <span className="promise-name">Envíos Rápidos</span>
            <span className="promise-desc">Llega a tu casa en el menor tiempo posible</span>
          </li>
          <li className="promise-item">
            <Gift size={16} strokeWidth={1.75} aria-hidden="true" />
            <span className="promise-name">Empaques Bonitos</span>
            <span className="promise-desc">Perfectos para regalar y sorprender</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
