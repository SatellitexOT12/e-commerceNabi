import React, { createContext, useContext, useReducer, useEffect } from 'react'

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

export interface Agregado {
  id: string
  nombre: string
  precio: number
  cantidad?: number
  reinversion?: number
  fondo?: number
}

export interface CartItem {
  product: Product
  quantity: number
  agregos?: Agregado[]
}

interface CartState {
  items: CartItem[]
  total: number
}

type CartAction =
  | { type: 'ADD_ITEM'; product: Product; agregos?: Agregado[] }
  | { type: 'REMOVE_ITEM'; productId: string }
  | { type: 'UPDATE_QUANTITY'; productId: string; quantity: number }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; items: CartItem[] }

const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => {
    const basePrice = item.product.precio * item.quantity
    const agregosPrice = item.agregos?.reduce((a, agg) => a + (agg.precio * (agg.cantidad || 1)), 0) || 0
    return sum + basePrice + agregosPrice
  }, 0)
}

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const newItems = [...state.items, { product: action.product, quantity: 1, agregos: action.agregos || [] }]
      return { items: newItems, total: calculateTotal(newItems) }
    }
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.product.id !== action.productId)
      return { items: newItems, total: calculateTotal(newItems) }
    }
    case 'UPDATE_QUANTITY': {
      const newItems = state.items.map(item =>
        item.product.id === action.productId
          ? { ...item, quantity: action.quantity }
          : item
      ).filter(item => item.quantity > 0)
      return { items: newItems, total: calculateTotal(newItems) }
    }
    case 'CLEAR_CART':
      return { items: [], total: 0 }
    case 'LOAD_CART':
      return { items: action.items, total: calculateTotal(action.items) }
    default:
      return state
  }
}

const CartContext = createContext<{
  state: CartState
  addItem: (product: Product, agregos?: Agregado[]) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
} | null>(null)

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0 })

  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        const items: CartItem[] = JSON.parse(savedCart)
        dispatch({ type: 'LOAD_CART', items })
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state.items))
  }, [state.items])

  const addItem = (product: Product, agregos?: Agregado[]) => {
    dispatch({ type: 'ADD_ITEM', product, agregos })
  }

  const removeItem = (productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', productId })
  }

  const updateQuantity = (productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', productId, quantity })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }

  return (
    <CartContext.Provider value={{ state, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}