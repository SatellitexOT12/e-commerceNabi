import { supabase } from './supabase'

export interface BlogPost {
  id: string
  user_id: string
  title: string
  description: string
  image_url: string
  likes: number
  created_at: string
}

export interface Like {
  id: string
  post_id: string
  user_id: string
}

// Obtener todos los posts
export const getBlogPosts = async (): Promise<BlogPost[]> => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

// Crear un nuevo post
export const createBlogPost = async (post: Omit<BlogPost, 'id' | 'created_at'>): Promise<BlogPost> => {
  const { data, error } = await supabase
    .from('blog_posts')
    .insert([post])
    .select()
    .single()
  if (error) throw error
  return data
}

// Subir imagen para el blog
export const uploadBlogImage = async (file: File): Promise<string> => {
  const fileName = `blog/${Date.now()}-${file.name.replace(/\s/g, '-')}`
  const { data, error } = await supabase.storage.from('pics').upload(fileName, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type
  })
  if (error) throw error
  
  const { data: urlData } = supabase.storage.from('pics').getPublicUrl(fileName)
  return urlData.publicUrl
}

// Dar like a un post
export const likePost = async (postId: string, userId: string): Promise<void> => {
  const { error } = await supabase
    .from('blog_likes')
    .insert([{ post_id: postId, user_id: userId }])
  if (error) throw error
  
  // Incrementar contador de likes
  const { data: post } = await supabase
    .from('blog_posts')
    .select('likes')
    .eq('id', postId)
    .single()
  
  if (post) {
    await supabase
      .from('blog_posts')
      .update({ likes: (post.likes || 0) + 1 })
      .eq('id', postId)
  }
}

// Remover like de un post
export const unlikePost = async (postId: string, userId: string): Promise<void> => {
  const { error } = await supabase
    .from('blog_likes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', userId)
  if (error) throw error
  
  // Decrementar contador de likes
  const { data: post } = await supabase
    .from('blog_posts')
    .select('likes')
    .eq('id', postId)
    .single()
  
  if (post) {
    await supabase
      .from('blog_posts')
      .update({ likes: Math.max(0, (post.likes || 0) - 1) })
      .eq('id', postId)
  }
}

// Verificar si un usuario dio like a un post
export const checkIfUserLiked = async (postId: string, userId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('blog_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return !!data
}

// Eliminar un post (solo admin)
export const deleteBlogPost = async (postId: string): Promise<void> => {
  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', postId)
  if (error) throw error
}
