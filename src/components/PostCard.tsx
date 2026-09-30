import React, { useState, useEffect } from 'react'
import { Heart, Share2 } from 'lucide-react'
import { BlogPost } from '../services/blog'
import { supabase } from '../services/supabase'
import './PostCard.css'

interface PostCardProps {
  post: BlogPost
  onLikeChange: () => void
  /** Forma de la entrada en el cuaderno: apertura (destacada) o entrada de la lista */
  variant?: 'featured' | 'entry'
  /** Nº de entrada dentro del cuaderno (orden cronológico) */
  entryNumber?: number
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onLikeChange,
  variant = 'entry',
  entryNumber,
}) => {
  const [liked, setLiked] = useState(false)
  const [isLiking, setIsLiking] = useState(false)
  const [likeCount, setLikeCount] = useState(post.likes)

  const getSessionId = () => {
    let sessionId = localStorage.getItem('anonymous_session_id')
    if (!sessionId) {
      sessionId = crypto.randomUUID()
      localStorage.setItem('anonymous_session_id', sessionId)
    }
    return sessionId
  }

  useEffect(() => {
    checkIfUserLiked()
  }, [post.id])

  const checkIfUserLiked = async () => {
    const sessionId = getSessionId()

    // maybeSingle(): el registro puede no existir todavía
    const { data, error } = await supabase
      .from('blog_likes')
      .select('id')
      .eq('post_id', post.id)
      .eq('session_id', sessionId)
      .maybeSingle()

    if (!error && data) {
      setLiked(true)
    }
  }

  const handleLike = async () => {
    if (isLiking) return
    setIsLiking(true)

    const sessionId = getSessionId()

    try {
      if (liked) {
        // Quitar like
        const { error } = await supabase
          .from('blog_likes')
          .delete()
          .eq('post_id', post.id)
          .eq('session_id', sessionId)

        if (error) throw error

        setLiked(false)
        setLikeCount(prev => prev - 1)

      } else {
        // Dar like
        const { error } = await supabase
          .from('blog_likes')
          .insert({
            post_id: post.id,
            session_id: sessionId,
            created_at: new Date().toISOString()
          })

        if (error) throw error

        setLiked(true)
        setLikeCount(prev => prev + 1)

      }

      onLikeChange()
    } catch (error) {
      console.error('Error al dar like:', error)
      alert('Hubo un error al procesar tu like. Intenta de nuevo.')
    } finally {
      setIsLiking(false)
    }
  }

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/#/blog/`
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.description,
          url: postUrl
        })
      } catch (error) {
        console.error('Error al compartir:', error)
      }
    } else {
      const text = `${post.title}\n${post.description}\n${postUrl}`
      navigator.clipboard.writeText(text).then(() => {
        alert('Enlace copiado al portapapeles')
      })
    }
  }

  const formattedDate = new Date(post.created_at).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const shortDate = new Date(post.created_at).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: '2-digit'
  })

  const isNew = () => {
    const postDate = new Date(post.created_at)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - postDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 7
  }

  const entryLabel = typeof entryNumber === 'number'
    ? `N.º ${String(entryNumber).padStart(2, '0')}`
    : ''
  const showNew = isNew()

  const actions = (
    <div className="post-actions">
      <button
        className={`action-btn like-btn ${liked ? 'liked' : ''}`}
        onClick={handleLike}
        disabled={isLiking}
        aria-pressed={liked}
        aria-label={liked ? 'Quitar me gusta de esta entrada' : 'Me gusta esta entrada'}
      >
        <Heart size={18} fill={liked ? 'currentColor' : 'none'} aria-hidden="true" />
        <span className="action-count">{likeCount}</span>
      </button>

      <button
        className="action-btn share-btn"
        onClick={handleShare}
        aria-label={`Compartir la entrada ${post.title}`}
      >
        <Share2 size={18} aria-hidden="true" />
        <span>Compartir</span>
      </button>
    </div>
  )

  if (variant === 'featured') {
    return (
      <article className="post-card post-card--featured">
        <figure className="post-figure">
          <span className="photo-corner photo-corner--tl" aria-hidden="true" />
          <span className="photo-corner photo-corner--tr" aria-hidden="true" />
          <span className="photo-corner photo-corner--bl" aria-hidden="true" />
          <span className="photo-corner photo-corner--br" aria-hidden="true" />
          <span className="photo-tape" aria-hidden="true" />
          <img src={post.image_url} alt={post.title} className="post-image" />
          {showNew && <span className="new-badge">Nuevo</span>}
        </figure>

        <div className="post-content">
          <div className="post-meta">
            {entryLabel && <span className="post-index">{entryLabel}</span>}
            <time className="post-date" dateTime={post.created_at}>{formattedDate}</time>
          </div>

          <h2 className="post-title">{post.title}</h2>

          <p className="post-description">{post.description}</p>

          {actions}
        </div>
      </article>
    )
  }

  return (
    <article className="post-card post-card--entry">
      <div className="entry-meta">
        {entryLabel && <span className="post-index">{entryLabel}</span>}
        <time className="post-date" dateTime={post.created_at}>{shortDate}</time>
      </div>

      <figure className="entry-figure">
        <img src={post.image_url} alt={post.title} className="entry-image" />
        {showNew && <span className="new-badge new-badge--on-photo">Nuevo</span>}
      </figure>

      <div className="post-content">
        <h3 className="post-title">{post.title}</h3>

        <p className="post-description">{post.description}</p>

        {actions}
      </div>
    </article>
  )
}
