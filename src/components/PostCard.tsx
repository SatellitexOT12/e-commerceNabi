import React, { useState, useEffect } from 'react'
import { Heart, Share2 } from 'lucide-react'
import { BlogPost } from '../services/blog'
import { supabase } from '../services/supabase'
import './PostCard.css'

interface PostCardProps {
  post: BlogPost
  onLikeChange: () => void
}

export const PostCard: React.FC<PostCardProps> = ({ post, onLikeChange }) => {
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
    
    // ✅ Cambio 1: maybeSingle() en lugar de single()
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
        
        // ❌ ELIMINADO: ya no actualizamos manualmente blog_posts
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
        
        // ❌ ELIMINADO: ya no actualizamos manualmente blog_posts
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
    const postUrl = `${window.location.origin}/#/blog/${post.id}`
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

  return (
    <div className="post-card">
      <div className="post-image-container">
        <img src={post.image_url} alt={post.title} className="post-image" />
      </div>

      <div className="post-content">
        <div className="post-header">
          <h3 className="post-title">{post.title}</h3>
          <p className="post-date">{formattedDate}</p>
        </div>

        <p className="post-description">{post.description}</p>

        <div className="post-actions">
          <button
            className={`action-btn like-btn ${liked ? 'liked' : ''}`}
            onClick={handleLike}
            disabled={isLiking}
          >
            <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
            <span className="action-count">{likeCount}</span>
          </button>

          <button className="action-btn share-btn" onClick={handleShare}>
            <Share2 size={20} />
            <span>Compartir</span>
          </button>
        </div>
      </div>
    </div>
  )
}