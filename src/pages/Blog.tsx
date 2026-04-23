import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getBlogPosts, checkIfUserLiked, BlogPost } from '../services/blog'
import { getCurrentUser } from '../services/auth'
import { PostCard } from '../components/PostCard'
import { CreatePost } from '../components/CreatePost'
import './Blog.css'

export const Blog: React.FC = () => {
  const navigate = useNavigate()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [userLikes, setUserLikes] = useState<Record<string, boolean>>({})
  const [isAdmin, setIsAdmin] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
        
        // Verificar si es admin (si está logueado)
        if (currentUser) {
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

      // Cargar likes del usuario actual
      if (user) {
        const likes: Record<string, boolean> = {}
        for (const post of data) {
          const liked = await checkIfUserLiked(post.id, user.id)
          likes[post.id] = liked
        }
        setUserLikes(likes)
      }
    } catch (error) {
      console.error('Error loading posts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPosts()
  }, [user])

  const handlePostCreated = () => {
    loadPosts()
  }

  const handleLikeChange = () => {
    loadPosts()
  }

  return (
    <div className="blog-page">
      <div className="blog-hero">
        <div className="blog-hero-content">
          <h1>Blog MiniNabi</h1>
          <p>Actualizaciones, novedades y todo lo que necesitas saber sobre nuestros dulces artesanales</p>
        </div>
      </div>

      <div className="blog-container">
        {isAdmin && (
          <div className="admin-section">
            <CreatePost onPostCreated={handlePostCreated} />
          </div>
        )}

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Cargando posts...</p>
          </div>
        ) : posts.length > 0 ? (
          <div className="posts-grid">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                userLiked={userLikes[post.id] || false}
                onLikeChange={handleLikeChange}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h2>Sin posts aún</h2>
            <p>Sigue nuestro blog para las actualizaciones más recientes sobre MiniNabi</p>
          </div>
        )}
      </div>
    </div>
  )
}
