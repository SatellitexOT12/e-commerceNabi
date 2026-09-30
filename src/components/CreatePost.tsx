import React, { useState, useEffect } from 'react'
import { PenLine, Upload, X, AlertCircle } from 'lucide-react'
import { createBlogPost, uploadBlogImage } from '../services/blog'
import { getCurrentUser } from '../services/auth'
import './CreatePost.css'

interface CreatePostProps {
  onPostCreated: () => void
}

export const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, isLoading])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('El título es requerido')
      return
    }

    if (!description.trim()) {
      setError('La descripción es requerida')
      return
    }

    if (!image) {
      setError('Debes seleccionar una imagen')
      return
    }

    setIsLoading(true)

    try {
      const user = await getCurrentUser()
      if (!user) {
        setError('Debes estar logueado para crear un post')
        setIsLoading(false)
        return
      }

      // Subir imagen
      const imageUrl = await uploadBlogImage(image)

      // Crear post
      await createBlogPost({
        user_id: user.id,
        title: title.trim(),
        description: description.trim(),
        image_url: imageUrl,
        likes: 0
      })

      // Limpiar formulario
      setTitle('')
      setDescription('')
      setImage(null)
      setImagePreview('')
      setIsOpen(false)

      // Notificar al componente padre
      onPostCreated()
    } catch (err) {
      console.error('Error al crear post:', err)
      setError('Error al crear el post. Intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <button
        className="create-post-trigger"
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
      >
        <PenLine size={18} aria-hidden="true" />
        <span>Nueva entrada</span>
      </button>

      {isOpen && (
        <div className="modal-overlay" onClick={() => !isLoading && setIsOpen(false)}>
          <div
            className="modal-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-post-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 id="create-post-title">Nueva entrada</h2>
              <button
                className="close-btn"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
                aria-label="Cerrar el formulario"
              >
                <X size={22} aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="create-post-form">
              {/* Image Upload */}
              <div className="form-group">
                <label htmlFor="image" className="form-label">
                  Imagen *
                </label>
                {imagePreview ? (
                  <div className="compose-mount">
                    <span className="compose-tape" aria-hidden="true" />
                    <span className="compose-corner compose-corner--tl" aria-hidden="true" />
                    <span className="compose-corner compose-corner--tr" aria-hidden="true" />
                    <span className="compose-corner compose-corner--bl" aria-hidden="true" />
                    <span className="compose-corner compose-corner--br" aria-hidden="true" />
                    <img
                      src={imagePreview}
                      alt="Vista previa de la imagen seleccionada"
                      className="compose-photo"
                    />
                    <button
                      type="button"
                      className="remove-image"
                      aria-label="Quitar la imagen seleccionada"
                      onClick={() => {
                        setImage(null)
                        setImagePreview('')
                      }}
                    >
                      <X size={18} aria-hidden="true" />
                    </button>
                  </div>
                ) : (
                  <label htmlFor="image" className="upload-area">
                    <Upload size={30} aria-hidden="true" />
                    <p>Selecciona una imagen</p>
                    <small>JPG, PNG o WebP - Máx 5MB</small>
                    <input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden-input"
                    />
                  </label>
                )}
              </div>

              {/* Title */}
              <div className="form-group">
                <label htmlFor="title" className="form-label">
                  Título *
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Título del post"
                  className="form-input"
                  maxLength={100}
                  disabled={isLoading}
                  autoFocus
                />
                <small className="char-count data">{title.length}/100</small>
              </div>

              {/* Description */}
              <div className="form-group">
                <label htmlFor="description" className="form-label">
                  Descripción *
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Cuéntale a tus seguidores sobre este post..."
                  className="form-textarea"
                  rows={5}
                  maxLength={500}
                  disabled={isLoading}
                />
                <small className="char-count data">{description.length}/500</small>
              </div>

              {error && (
                <div className="error-message" role="alert">
                  <AlertCircle size={18} aria-hidden="true" />
                  <span>{error}</span>
                </div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={isLoading}
                >
                  {isLoading ? 'Publicando…' : 'Publicar entrada'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
