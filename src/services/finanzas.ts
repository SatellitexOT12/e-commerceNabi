import { supabase } from './supabase'
import { addGananciaToSocia } from './socias'

export interface Finanzas {
  id: string
  reinversion: number
  fondo: number
  ahorro: number
  ganancia_personal: number
  created_at: string
  updated_at: string
}

export const getFinanzas = async (): Promise<Finanzas | null> => {
  const { data, error } = await supabase.from('finanzas').select('*').limit(1).single()
  if (error && error.code !== 'PGRST116') {
    throw error
  }
  return data || null
}

export const createFinanzas = async (): Promise<Finanzas> => {
  const { data, error } = await supabase
    .from('finanzas')
    .insert([
      {
        reinversion: 0,
        fondo: 0,
        ahorro: 0,
        ganancia_personal: 0
      }
    ])
    .select()
    .single()
  if (error) throw error
  return data
}

export const updateFinanzas = async (finanzas: Partial<Omit<Finanzas, 'id' | 'created_at' | 'updated_at'>>) => {
  const existing = await getFinanzas()
  if (!existing) {
    return createFinanzas()
  }

  const { data, error } = await supabase
    .from('finanzas')
    .update(finanzas)
    .eq('id', existing.id)
    .select()
    .single()
  if (error) throw error
  return data
}

export const addToFinanzas = async (order: any) => {
  const existing = await getFinanzas()
  if (!existing) {
    await createFinanzas()
    return addToFinanzas(order)
  }

  // Calcular reinversion, fondo y ganancia_bruta del pedido (igual que en dashboard)
  let orderReinversion = 0
  let orderFondo = 0
  let orderGananciaBruta = 0

  // Process each product in the order
  order.productos?.forEach((item: any) => {
    const product = item.product
    const quantity = item.quantity || 1

    // Calculate reinversion and fondo from product
    const productReinversion = (product?.reinversion || 0) * quantity
    const productFondo = (product?.fondo || 0) * quantity

    orderReinversion += productReinversion
    orderFondo += productFondo

    // Calculate gross profit for this product line
    const productGananciaBruta = (product?.precio || 0) * quantity - productReinversion - productFondo
    orderGananciaBruta += productGananciaBruta

    // Process agregos if present
    if (item.agregos && Array.isArray(item.agregos)) {
      item.agregos.forEach((agrego: any) => {
        const agregoQty = agrego.cantidad || 1

        const agregoReinversion = (agrego?.reinversion || 0) * agregoQty
        const agregoFondo = (agrego?.fondo || 0) * agregoQty

        orderReinversion += agregoReinversion
        orderFondo += agregoFondo

        const agregoGananciaBruta = (agrego?.precio || 0) * agregoQty - agregoReinversion - agregoFondo
        orderGananciaBruta += agregoGananciaBruta
      })
    }
  })

  // Distribuir la ganancia bruta: 30% ahorro, 70% ganancia personal
  const ahorro = orderGananciaBruta * 0.3
  const ganancia_personal = orderGananciaBruta * 0.7

  // Dividir la ganancia personal 50/50 entre Gabriela y Lorena
  const ganancia_por_socia = ganancia_personal / 2

  try {
    await addGananciaToSocia('Gabriela', ganancia_por_socia)
    await addGananciaToSocia('Lorena', ganancia_por_socia)
  } catch (error) {
    console.error('Error distributing to socias:', error)
  }

  return updateFinanzas({
    reinversion: Math.round((existing.reinversion + orderReinversion) * 100) / 100,
    fondo: Math.round((existing.fondo + orderFondo) * 100) / 100,
    ahorro: Math.round((existing.ahorro + ahorro) * 100) / 100,
    ganancia_personal: Math.round((existing.ganancia_personal + ganancia_personal) * 100) / 100
  })
}
