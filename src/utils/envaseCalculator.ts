import { Agregado } from '../contexts/CartContext'
import { Agregado as AgregadoDB } from '../services/agregos'

export interface Product {
  id: string
  nombre: string
  descripcion: string
  precio: number
  categoria: string
  imagen_url: string
  disponible: boolean
  reinversion?: number
  fondo?: number
}

// Helper checks
const esMiniDonas = (product: Product): boolean => product.categoria === 'Mini Donas'
const esCrepes = (product: Product): boolean => product.categoria === 'Crepes'

export const calcularEnvasesNecesarios = (product: Product, cantidad: number): number => {
  if (esMiniDonas(product)) {
    return Math.ceil(cantidad / 24)
  }
  if (esCrepes(product)) {
    return Math.ceil(cantidad / 8)
  }
  return 0
}

export const filtrarEnvases = <T extends { nombre: string; id: string }>(agregos: T[]): T | undefined => {
  return agregos.find(agg => agg.nombre.toLowerCase() === 'envase')
}

/**
 * Adds automatic "Envase" agrego to the list based on product type and quantity.
 * @param product - The product being added
 * @param cantidad - Quantity of the product
 * @param agregosSeleccionados - List of manually selected agregos
 * @param todosAgregos - Full list of all agregos from DB (including unavailable) to find the Envase definition
 * @returns New array of agregos with the envase included/adjusted
 */
export const getAgregosConEnvaseAuto = (
  product: Product,
  cantidad: number,
  agregosSeleccionados: Agregado[],
  todosAgregos: AgregadoDB[]
): Agregado[] => {
  const envasesNecesarios = calcularEnvasesNecesarios(product, cantidad)

  if (envasesNecesarios === 0) {
    return agregosSeleccionados
  }

  const envaseAgrego = filtrarEnvases(todosAgregos) as AgregadoDB | undefined

  if (!envaseAgrego) {
    console.warn('No se encontró el agrego "Envase" en la base de datos')
    return agregosSeleccionados
  }

  // Make a copy of the existing selected agregos
  const agregosConEnvase = [...agregosSeleccionados]

  // Check if envase already exists in the list
  const envaseExistenteIndex = agregosConEnvase.findIndex(a => a.id === envaseAgrego.id)

  if (envaseExistenteIndex !== -1) {
    // Update quantity to the maximum needed
    const cantidadActual = agregosConEnvase[envaseExistenteIndex].cantidad || 1
    const cantidadTotal = Math.max(cantidadActual, envasesNecesarios)
    agregosConEnvase[envaseExistenteIndex] = {
      ...envaseAgrego,
      cantidad: cantidadTotal
    } as Agregado
  } else {
    // Add new envase with all fields from the DB record
    agregosConEnvase.push({
      ...envaseAgrego,
      cantidad: envasesNecesarios
    } as Agregado)
  }

  return agregosConEnvase
}
