/**
 * Format a price number to display without trailing .00
 * Examples:
 *   1000 -> "$1000"
 *   1500.00 -> "$1500"
 *   1234.5 -> "$1234.50"
 *   999.99 -> "$999.99"
 *   0.5 -> "$0.50"
 */
export const formatPrice = (price: number): string => {
  // Si es entero, mostrar sin decimales
  if (Number.isInteger(price)) {
    return `$${price}`
  }

  // Si tiene decimales, mostrar 2 dígitos (excepto si termina en .00)
  const rounded = Math.round(price * 100) / 100
  const str = rounded.toFixed(2)

  // Eliminar .00 si es entero después del redondeo
  if (str.endsWith('.00')) {
    return `$${Math.floor(rounded)}`
  }

  return `$${str}`
}

/**
 * Format price for WhatsApp message (with 2 decimals always)
 */
export const formatPriceForWhatsApp = (price: number): string => {
  return `$${price.toFixed(2)}`
}
