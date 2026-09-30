import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getBlogPosts, BlogPost } from '../services/blog'
import { supabase } from '../services/supabase'
import { PostCard } from '../components/PostCard'
import { CreatePost } from '../components/CreatePost'
import './Blog.css'

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: '2-digit'
  })

export const Blog: React.FC = () => {
  const navigate = useNavigate()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  // El pegado de la primera carga solo ocurre una vez: un like no vuelve a animar la página
  const [animateIn, setAnimateIn] = useState(true)
  const settleTimer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (settleTimer.current !== null) {
        window.clearTimeout(settleTimer.current)
      }
    }
  }, [])

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data } = await supabase.auth.getUser()
        // Verificar si es admin (si está logueado)
        if (data?.user) {
          setIsAdmin(true)
        }
      } catch (error) {
        console.error('Error getting user:', error)
      }
    }
    loadData()
  }, [])

  const loadPosts = async () => {
    try {
      setLoading(true)
      const data = await getBlogPosts()
      setPosts(data)
      setError(false)
    } catch (error) {
      console.error('Error loading posts:', error)
      setError(true)
    } finally {
      setLoading(false)
    }

    if (settleTimer.current === null) {
      settleTimer.current = window.setTimeout(() => setAnimateIn(false), 1500)
    }
  }

  useEffect(() => {
    loadPosts()
  }, [])

  const handlePostCreated = () => {
    loadPosts()
  }

  const handleLikeChange = () => {
    loadPosts()
  }

  const featuredPost = posts[0]
  const regularPosts = posts.slice(1)
  // Cronológico: la entrada más vieja es la Nº 01, la más reciente cierra el cuaderno
  const entryNumber = (index: number) => posts.length - index

  return (
    <div className={`blog-page${animateIn ? ' is-animating' : ''}`}>
      <header className="notebook-head">
        <div className="notebook-head-inner">
          <h1 className="notebook-title">Blog MiniNabi</h1>
          <p className="notebook-lede">
            Actualizaciones, novedades y todo lo que necesitas saber sobre nuestros dulces
            artesanales
          </p>
          {!loading && posts.length > 0 && (
            <p className="notebook-folio">
              <span className="folio-item">{String(posts.length).padStart(2, '0')} entradas</span>
              <span className="folio-item">Última: {shortDate(posts[0].created_at)}</span>
            </p>
          )}
        </div>
      </header>

      <div className="blog-container">
        {isAdmin && (
          <div className="admin-bar">
            <CreatePost onPostCreated={handlePostCreated} />
            <p className="admin-note">Zona del taller: aquí se apuntan las entradas nuevas.</p>
          </div>
        )}

        {loading ? (
          <div className="state-block state-loading" role="status" aria-live="polite">
            <p className="state-text">Cargando entradas del cuaderno…</p>
            <div className="skeleton-list" aria-hidden="true">
              {[0, 1, 2].map((row) => (
                <div className="skeleton-row" key={row}>
                  <span className="sk sk-meta" />
                  <span className="sk sk-photo" />
                  <span className="sk-lines">
                    <span className="sk sk-line sk-line--a" />
                    <span className="sk sk-line sk-line--b" />
                    <span className="sk sk-line sk-line--c" />
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : error && posts.length === 0 ? (
          <div className="state-block state-error" role="alert">
            <h2>No se pudieron cargar las entradas</h2>
            <p>
              El cuaderno no respondió. Revisa la conexión y vuelve a intentarlo; si sigue
              fallando, avísanos desde el formulario de contacto.
            </p>
            <button type="button" className="blog-btn" onClick={loadPosts}>
              Reintentar
            </button>
          </div>
        ) : posts.length > 0 ? (
          <>
            <section className="featured-section" aria-label="Entrada más reciente">
              <PostCard
                post={featuredPost}
                onLikeChange={handleLikeChange}
                variant="featured"
                entryNumber={entryNumber(0)}
              />
            </section>

            {regularPosts.length > 0 && (
              <section className="entries-section" aria-label="Entradas anteriores">
                <h2 className="entries-heading">
                  Entradas anteriores
                  <span className="entries-count">{String(regularPosts.length).padStart(2, '0')}</span>
                </h2>
                <ol className="entries-list" role="list">
                  {regularPosts.map((post, index) => (
                    <li key={post.id}>
                      <PostCard
                        post={post}
                        onLikeChange={handleLikeChange}
                        variant="entry"
                        entryNumber={entryNumber(index + 1)}
                      />
                    </li>
                  ))}
                </ol>
              </section>
            )}
          </>
        ) : (
          <div className="state-block state-empty">
            <h2>El cuaderno está en blanco</h2>
            <p>
              Todavía no se ha apuntado ninguna entrada. Cuando el taller tenga una novedad —una
              receta de temporada, un aviso de horarios, un pedido especial— quedará escrita aquí,
              con su fecha y su número.
            </p>
            <p className="state-hand">
              {isAdmin
                ? 'la pluma está sobre la mesa: escribe la primera'
                : 'volvemos a escribir pronto'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
