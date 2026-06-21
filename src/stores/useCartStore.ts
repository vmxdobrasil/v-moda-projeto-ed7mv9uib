import { useSyncExternalStore } from 'react'

export interface CartItem {
  id: string
  product: any
  quantity: number
  size?: string
  color?: string
}

interface CartStore {
  items: CartItem[]
}

let cartState: CartStore = { items: [] }
const listeners = new Set<() => void>()

try {
  const saved = localStorage.getItem('v-moda-cart')
  if (saved) {
    cartState = JSON.parse(saved)
  }
} catch {
  /* intentionally ignored */
}

function emitChange() {
  localStorage.setItem('v-moda-cart', JSON.stringify(cartState))
  listeners.forEach((listener) => listener())
}

const store = {
  addItem: (item: Omit<CartItem, 'id'>) => {
    const existing = cartState.items.find(
      (i) => i.product.id === item.product.id && i.size === item.size && i.color === item.color,
    )
    if (existing) {
      cartState = {
        items: cartState.items.map((i) =>
          i.id === existing.id ? { ...i, quantity: i.quantity + item.quantity } : i,
        ),
      }
    } else {
      cartState = {
        items: [...cartState.items, { ...item, id: Math.random().toString(36).slice(2) }],
      }
    }
    emitChange()
  },
  removeItem: (id: string) => {
    cartState = {
      items: cartState.items.filter((i) => i.id !== id),
    }
    emitChange()
  },
  updateQuantity: (id: string, qty: number) => {
    cartState = {
      items: cartState.items.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, qty) } : i)),
    }
    emitChange()
  },
  clearCart: () => {
    cartState = { items: [] }
    emitChange()
  },
  subscribe: (listener: () => void) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  getSnapshot: () => cartState,
}

export default function useCartStore() {
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot)
  return {
    items: state.items,
    addItem: store.addItem,
    removeItem: store.removeItem,
    updateQuantity: store.updateQuantity,
    clearCart: store.clearCart,
  }
}

useCartStore.getState = () => store.getSnapshot()
