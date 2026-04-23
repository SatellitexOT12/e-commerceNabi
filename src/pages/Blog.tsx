import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getBlogPosts, BlogPost } from '../services/blog'
import { supabase } from '../services/supabase'
import { PostCard } from '../components/PostCard'
import { CreatePost } from '../components/CreatePost'
import './Blog.css'

export const Blog: React.FC = () => {
  const navigate = useNavigate()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

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
    } catch (error) {
      console.error('Error loading posts:', error)
    } finally {
      setLoading(false)
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
