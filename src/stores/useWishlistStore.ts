import { useState, useEffect } from 'react'

let wishlistIds: string[] = []
try {
  wishlistIds = JSON.parse(localStorage.getItem('wishlist') || '[]')
} catch (e) {
  wishlistIds = []
}

const listeners = new Set<() => void>()

function notify() {
  localStorage.setItem('wishlist', JSON.stringify(wishlistIds))
  listeners.forEach((listener) => listener())
}

export default function useWishlistStore() {
  const [items, setItems] = useState<string[]>(wishlistIds)

  useEffect(() => {
    const listener = () => setItems([...wishlistIds])
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  const toggleWishlist = (productId: string) => {
    if (wishlistIds.includes(productId)) {
      wishlistIds = wishlistIds.filter((id) => id !== productId)
    } else {
      wishlistIds.push(productId)
    }
    notify()
  }

  const isInWishlist = (productId: string) => items.includes(productId)

  return { items, toggleWishlist, isInWishlist }
}
