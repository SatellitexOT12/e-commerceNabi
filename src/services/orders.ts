import { supabase } from './supabase'

export interface Order {
  id: string
  cliente_nombre: string
  cliente_direccion: string
  cliente_telefono: string
  productos: { product: any; quantity: number; agregos?: any[] }[]
  total: number
  fecha: string
  fecha_entrega?: string
  estado: string
}

export const saveOrder = async (order: Omit<Order, 'id' | 'fecha'>) => {
  const { data, error } = await supabase.from('orders').insert([order]).select()
  if (error) throw error
  return data[0]
}

export const getOrders = async (): Promise<Order[]> => {
  const { data, error } = await supabase.from('orders').select('*')
  if (error) throw error
  
  // Ordenar: pendiente primero, luego por fecha_entrega más cercana
  return (data || []).sort((a, b) => {
    // Primero: pendiente vs otros
    if (a.estado === 'pendiente' && b.estado !== 'pendiente') return -1
    if (a.estado !== 'pendiente' && b.estado === 'pendiente') return 1
    
    // Luego: por fecha_entrega (más cercana primero)
    const fechaA = a.fecha_entrega ? new Date(a.fecha_entrega).getTime() : Infinity
    const fechaB = b.fecha_entrega ? new Date(b.fecha_entrega).getTime() : Infinity
    return fechaA - fechaB
  })
}

export const updateOrderStatus = async (id: string, estado: string): Promise<void> => {
  const { error } = await supabase.from('orders').update({ estado }).eq('id', id)
  if (error) throw error
}

export const updateOrderDeliveryDate = async (id: string, fecha_entrega: string): Promise<void> => {
  const { error } = await supabase.from('orders').update({ fecha_entrega }).eq('id', id)
  if (error) throw error
}

export const deleteOrder = async (id: string): Promise<void> => {
  const { error } = await supabase.from('orders').delete().eq('id', id)
  if (error) throw error
}