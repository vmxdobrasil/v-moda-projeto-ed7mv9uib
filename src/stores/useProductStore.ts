import { useState, useEffect } from 'react'
import { PRODUCTS } from '@/lib/data'

let localProducts = [...PRODUCTS]
try {
  const stored = localStorage.getItem('vmoda_products')
  if (stored) {
    localProducts = JSON.parse(stored)
  }
} catch (e) {
  // ignore
}

const listeners = new Set<() => void>()
function notify() {
  localStorage.setItem('vmoda_products', JSON.stringify(localProducts))
  listeners.forEach((listener) => listener())
}

export function useProductStore() {
  const [data, setData] = useState(localProducts)

  useEffect(() => {
    const listener = () => setData([...localProducts])
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  const updateWholesalePrices = (
    productIds: string[],
    type: 'percentage' | 'fixed',
    value: number,
  ) => {
    productIds.forEach((id) => {
      const p = localProducts.find((x) => x.id === id)
      if (p) {
        if (type === 'percentage') {
          p.wholesalePrice = (p.wholesalePrice || p.price) * (1 + value / 100)
        } else {
          p.wholesalePrice = value
        }
      }
    })
    notify()
  }

  return { products: data, updateWholesalePrices }
}
