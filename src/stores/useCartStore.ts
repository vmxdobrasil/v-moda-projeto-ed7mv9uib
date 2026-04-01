import { useState, useEffect } from 'react'
import { Product } from '@/lib/data'
import { trackEvent } from '@/lib/analytics'

export interface CartItem {
  product: Product
  quantity: number
  size?: string
}

let cartItems: CartItem[] = []
try {
  cartItems = JSON.parse(localStorage.getItem('cart') || '[]')
} catch (e) {
  cartItems = []
}

const listeners = new Set<() => void>()

function notify() {
  localStorage.setItem('cart', JSON.stringify(cartItems))
  listeners.forEach((listener) => listener())
}

export default function useCartStore() {
  const [items, setItems] = useState<CartItem[]>(cartItems)

  useEffect(() => {
    const listener = () => setItems([...cartItems])
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  const addToCart = (product: Product, quantity = 1, size?: string) => {
    const existing = cartItems.find((item) => item.product.id === product.id && item.size === size)
    if (existing) {
      existing.quantity += quantity
    } else {
      cartItems.push({ product, quantity, size })
    }

    trackEvent('add_to_cart', {
      currency: 'BRL',
      value: product.price * quantity,
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          price: product.price,
          currency: 'BRL',
          quantity,
        },
      ],
    })

    notify()
  }

  const removeFromCart = (productId: string, size?: string) => {
    cartItems = cartItems.filter((item) => !(item.product.id === productId && item.size === size))
    notify()
  }

  const updateQuantity = (productId: string, quantity: number, size?: string) => {
    const existing = cartItems.find((item) => item.product.id === productId && item.size === size)
    if (existing) {
      if (quantity <= 0) {
        removeFromCart(productId, size)
      } else {
        existing.quantity = quantity
        notify()
      }
    }
  }

  const clearCart = () => {
    cartItems = []
    notify()
  }

  const cartTotal = items.reduce((total, item) => total + item.product.price * item.quantity, 0)

  return { items, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal }
}
