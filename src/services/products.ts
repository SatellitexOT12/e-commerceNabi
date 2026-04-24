import { supabase } from './supabase'
import { Product } from '../contexts/CartContext'

export type { Product }

export const getProducts = async (limit?: number): Promise<Product[]> => {
  let query = supabase.from('products').select('*')
  if (limit) query = query.limit(limit)
  const { data, error } = await query
  if (error) throw error
  return data || []
}

export const getProductsByCategory = async (categoria: string): Promise<Product[]> => {
  const { data, error } = await supabase.from('products').select('*').eq('categoria', categoria)
  if (error) throw error
  return data || []
}

export const uploadProductImage = async (file: File): Promise<string> => {
  const fileName = `${Date.now()}-${file.name.replace(/\s/g, '-')}`
  const { data, error } = await supabase.storage.from('products').upload(fileName, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type
  })
  if (error) throw error
  
  const { data: urlData } = supabase.storage.from('products').getPublicUrl(fileName)
  return urlData.publicUrl
}

export const createProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
  const { data, error } = await supabase.from('products').insert(product).select().single()
  if (error) throw error
  return data
}

export const updateProduct = async (id: string, product: Partial<Product>): Promise<Product> => {
  const { data, error } = await supabase.from('products').update(product).eq('id', id).select().single()
  if (error) throw error
  return data
}

export const deleteProduct = async (id: string): Promise<void> => {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
}