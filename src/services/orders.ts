import { supabase } from './supabase'

export interface Order {
  id: string
  cliente_nombre: string
  cliente_direccion: string
  cliente_telefono: string
  productos: { product: any; quantity: number }[]
  total: number
  fecha: string
  estado: string
}

export const saveOrder = async (order: Omit<Order, 'id' | 'fecha'>) => {
  const { data, error } = await supabase.from('orders').insert([order]).select()
  if (error) throw error
  return data[0]
}

export const getOrders = async (): Promise<Order[]> => {
  const { data, error } = await supabase.from('orders').select('*').order('fecha', { ascending: false })
  if (error) throw error
  return data || []
}

export const updateOrderStatus = async (id: string, estado: string): Promise<void> => {
  const { error } = await supabase.from('orders').update({ estado }).eq('id', id)
  if (error) throw error
}