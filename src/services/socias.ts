import { supabase } from './supabase'
import { getFinanzas, updateFinanzas } from './finanzas'

export interface Socia {
  id: string
  nombre: string
  ganancia_total: number
  ganancia_retirada: number
  ganancia_disponible: number
  created_at: string
  updated_at: string
}

export interface RetiroSocia {
  id: string
  socia_id: string
  socia_nombre: string
  monto: number
  fecha: string
  concepto?: string
  created_at: string
}

// Obtener datos de una socia por nombre
export const getSociaByName = async (nombre: string): Promise<Socia | null> => {
  const { data, error } = await supabase
    .from('socias')
    .select('*')
    .eq('nombre', nombre)
    .single()
  
  if (error && error.code !== 'PGRST116') {
    throw error
  }
  return data || null
}

// Obtener todas las socias
export const getAllSocias = async (): Promise<Socia[]> => {
  const { data, error } = await supabase
    .from('socias')
    .select('*')
    .order('nombre')
  
  if (error) throw error
  return data || []
}

// Inicializar socias (ejecutar solo una vez)
export const initializeSocias = async () => {
  const existing = await getAllSocias()
  if (existing.length === 0) {
    const { error } = await supabase
      .from('socias')
      .insert([
        {
          nombre: 'Gabriela',
          ganancia_total: 0,
          ganancia_retirada: 0,
          ganancia_disponible: 0
        },
        {
          nombre: 'Lorena',
          ganancia_total: 0,
          ganancia_retirada: 0,
          ganancia_disponible: 0
        }
      ])
    if (error) throw error
  }
}

// Añadir ganancia a una socia (cuando se completa un pedido)
export const addGananciaToSocia = async (nombreSocia: string, monto: number) => {
  const socia = await getSociaByName(nombreSocia)
  if (!socia) {
    throw new Error(`Socia ${nombreSocia} no encontrada`)
  }

  const { error } = await supabase
    .from('socias')
    .update({
      ganancia_total: socia.ganancia_total + monto,
      ganancia_disponible: socia.ganancia_disponible + monto,
      updated_at: new Date().toISOString()
    })
    .eq('id', socia.id)
  
  if (error) throw error
}

// Retirar dinero de una socia
export const retiroDineroSocia = async (
  nombreSocia: string,
  monto: number,
  concepto?: string
): Promise<RetiroSocia> => {
  const socia = await getSociaByName(nombreSocia)
  if (!socia) {
    throw new Error(`Socia ${nombreSocia} no encontrada`)
  }

  if (socia.ganancia_disponible < monto) {
    throw new Error(`Fondos insuficientes. Disponible: $${socia.ganancia_disponible.toFixed(2)}`)
  }

  // Registrar el retiro
  const { data: retiroData, error: retiroError } = await supabase
    .from('retiros_socias')
    .insert([
      {
        socia_id: socia.id,
        socia_nombre: nombreSocia,
        monto,
        concepto: concepto || 'Retiro',
        fecha: new Date().toISOString()
      }
    ])
    .select()
    .single()

  if (retiroError) throw retiroError

  // Actualizar ganancia disponible de la socia
  await supabase
    .from('socias')
    .update({
      ganancia_retirada: socia.ganancia_retirada + monto,
      ganancia_disponible: socia.ganancia_disponible - monto,
      updated_at: new Date().toISOString()
    })
    .eq('id', socia.id)

  // Descontar de la ganancia personal en finanzas
  try {
    const finanzas = await getFinanzas()
    if (finanzas) {
      const nuevaGanancia = Math.max(0, finanzas.ganancia_personal - monto)
      await updateFinanzas({
        ganancia_personal: Math.round(nuevaGanancia * 100) / 100
      })
    }
  } catch (error) {
    console.error('Error updating finanzas:', error)
  }

  return retiroData
}

// Obtener historial de retiros
export const getRetirosSocia = async (nombreSocia: string): Promise<RetiroSocia[]> => {
  const { data, error } = await supabase
    .from('retiros_socias')
    .select('*')
    .eq('socia_nombre', nombreSocia)
    .order('fecha', { ascending: false })
  
  if (error) throw error
  return data || []
}

// Obtener todos los retiros
export const getAllRetiros = async (): Promise<RetiroSocia[]> => {
  const { data, error } = await supabase
    .from('retiros_socias')
    .select('*')
    .order('fecha', { ascending: false })
  
  if (error) throw error
  return data || []
}
