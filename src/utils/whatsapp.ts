export const sendWhatsAppMessage = (message: string, phone: string) => {
  const url = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`
  window.open(url, '_blank')
}

export const sendToBothNumbers = async (message: string) => {
  const { getWhatsAppNumbers } = await import('../services/settings')
  try {
    const settings = await getWhatsAppNumbers()
    if (settings.whatsapp_numero1) {
      sendWhatsAppMessage(message, settings.whatsapp_numero1)
    }
    if (settings.whatsapp_numero2) {
      setTimeout(() => {
        sendWhatsAppMessage(message, settings.whatsapp_numero2)
      }, 1000)
    }
  } catch (error) {
    console.error('Error sending to WhatsApp:', error)
  }
}

export const generateOrderMessage = (order: any): string => {
  let message = '🍰 NUEVO PEDIDO 🍰\n\n'
  message += `Cliente: ${order.cliente_nombre}\n`
  message += `Dirección: ${order.cliente_direccion}\n`
  message += `Teléfono: ${order.cliente_telefono}\n\n`
  message += 'Productos:\n'
  order.productos.forEach((item: any, index: number) => {
    const price = (item.product.precio * item.quantity).toFixed(2)
    message += `${index + 1}. ${item.product.nombre} x${item.quantity} - $${price}\n`
    if (item.agregos && item.agregos.length > 0) {
      item.agregos.forEach((agrego: any) => {
        const cantidad = agrego.cantidad || 1
        const aggPrice = (agrego.precio * cantidad).toFixed(2)
        message += `   + ${agrego.nombre} x${cantidad} - $${aggPrice}\n`
      })
    }
  })
  message += `\nTotal: $${order.total.toFixed(2)}\n`
  if (order.detalles && order.detalles.trim()) {
    message += `\n📝 Detalles: ${order.detalles}\n`
  }
  message += `Fecha: ${new Date().toLocaleString()}\n`
  return message
}
