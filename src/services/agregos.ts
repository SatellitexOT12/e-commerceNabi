import { supabase } from './supabase'

export interface Agregado {
  id: string
  nombre: string
  precio: number
  categoria: string
  disponible: boolean
  reinversion?: number
  fondo?: number
}

export const getAgregos = async (): Promise<Agregado[]> => {
  const { data, error } = await supabase.from('agregos').select('*').eq('disponible', true)
  if (error) throw error
  return data || []
}

export const getAgregosByCategory = async (categoria: string): Promise<Agregado[]> => {
  const { data, error } = await supabase.from('agregos').select('*').eq('categoria', categoria).eq('disponible', true)
  if (error) throw error
  return data || []
}

export const createAgregado = async (agregado: Omit<Agregado, 'id'>): Promise<Agregado> => {
  const { data, error } = await supabase.from('agregos').insert(agregado).select().single()
  if (error) throw error
  return data
}

export const updateAgregado = async (id: string, agregado: Partial<Agregado>): Promise<Agregado> => {
  const { data, error } = await supabase.from('agregos').update(agregado).eq('id', id).select().single()
  if (error) throw error
  return data
}

export const deleteAgregado = async (id: string): Promise<void> => {
  const { error } = await supabase.from('agregos').delete().eq('id', id)
  if (error) throw error
}