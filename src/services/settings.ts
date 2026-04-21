import { supabase } from './supabase'

export const getWhatsAppNumbers = async () => {
  const { data, error } = await supabase.from('settings').select('whatsapp_numero1, whatsapp_numero2').single()
  if (error) throw error
  return data
}