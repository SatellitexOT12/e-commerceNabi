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

export interface RetiroFinanzas {
  id: string
  fuente: 'reinversion' | 'fondo' | 'ahorro'
  monto: number
  concepto?: string
  fecha: string
  created_at: string
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

  // Calcular reinversion, fondo y ganancia_bruta del pedido
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

// Retirar dinero de finanzas
export const retiroDineroFinanzas = async (
  fuente: 'reinversion' | 'fondo' | 'ahorro',
  monto: number,
  concepto?: string
): Promise<RetiroFinanzas> => {
  const finanzas = await getFinanzas()
  if (!finanzas) {
    throw new Error('Datos de finanzas no encontrados')
  }

  const fondoDisponible = finanzas[fuente]
  if (fondoDisponible < monto) {
    throw new Error(`Fondos insuficientes en ${fuente}. Disponible: $${fondoDisponible.toFixed(2)}`)
  }

  // Registrar el retiro
  const { data: retiroData, error: retiroError } = await supabase
    .from('retiros_finanzas')
    .insert([
      {
        fuente,
        monto,
        concepto: concepto || 'Retiro',
        fecha: new Date().toISOString()
      }
    ])
    .select()
    .single()

  if (retiroError) throw retiroError

  // Actualizar el saldo de finanzas
  const nuevoSaldo = Math.max(0, finanzas[fuente] - monto)
  await updateFinanzas({
    [fuente]: Math.round(nuevoSaldo * 100) / 100
  } as Partial<Omit<Finanzas, 'id' | 'created_at' | 'updated_at'>>)

  return retiroData
}

// Obtener historial de retiros
export const getRetirosFinanzas = async (): Promise<RetiroFinanzas[]> => {
  const { data, error } = await supabase
    .from('retiros_finanzas')
    .select('*')
    .order('fecha', { ascending: false })
  
  if (error) throw error
  return data || []
}

// Revertir los cambios de un pedido completado (para cuando se elimina)
export const removeFromFinanzas = async (order: any) => {
  const existing = await getFinanzas()
  if (!existing) {
    return
  }

  // Calcular reinversion, fondo y ganancia_bruta del pedido (igual que en addToFinanzas)
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

  // Calcular los montos que se iban a restar
  const ahorro = orderGananciaBruta * 0.3
  const ganancia_personal = orderGananciaBruta * 0.7

  // Dividir la ganancia personal 50/50 entre Gabriela y Lorena
  const ganancia_por_socia = ganancia_personal / 2

  try {
    // Importar la función para remover ganancia
    const { removeGananciaFromSocia } = await import('./socias')
    await removeGananciaFromSocia('Gabriela', ganancia_por_socia)
    await removeGananciaFromSocia('Lorena', ganancia_por_socia)
  } catch (error) {
    console.error('Error reverting socias:', error)
  }

  // Restar de las finanzas
  return updateFinanzas({
    reinversion: Math.round(Math.max(0, existing.reinversion - orderReinversion) * 100) / 100,
    fondo: Math.round(Math.max(0, existing.fondo - orderFondo) * 100) / 100,
    ahorro: Math.round(Math.max(0, existing.ahorro - ahorro) * 100) / 100,
    ganancia_personal: Math.round(Math.max(0, existing.ganancia_personal - ganancia_personal) * 100) / 100
  })
}
