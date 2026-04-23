import React, { useState } from 'react'
import { Heart, Share2 } from 'lucide-react'
import { BlogPost, likePost, unlikePost, checkIfUserLiked } from '../services/blog'
import './PostCard.css'

interface PostCardProps {
  post: BlogPost
  userLiked: boolean
  onLikeChange: () => void
}

export const PostCard: React.FC<PostCardProps> = ({ post, userLiked, onLikeChange }) => {
  const [liked, setLiked] = useState(userLiked)
  const [isLiking, setIsLiking] = useState(false)

  const handleLike = async () => {
    if (isLiking) return
    setIsLiking(true)

    try {
      const user = await (await import('../services/auth')).getCurrentUser()
      if (!user) {
        alert('Necesitas estar logueado para dar like')
        setIsLiking(false)
        return
      }

      if (liked) {
        await unlikePost(post.id, user.id)
        setLiked(false)
      } else {
        await likePost(post.id, user.id)
        setLiked(true)
      }
      onLikeChange()
    } catch (error) {
      console.error('Error al dar like:', error)
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
      // Fallback para navegadores que no soportan Share API
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
            <span className="action-count">{post.likes}</span>
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
