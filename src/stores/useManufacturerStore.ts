import { useState, useEffect } from 'react'

export interface Manufacturer {
  id: string
  name: string
  vmp: number
}

const DEFAULT_MANUFACTURERS: Manufacturer[] = [
  { id: 'm1', name: 'Seda & Co.', vmp: 5 },
  { id: 'm2', name: 'Alfaiataria Premium', vmp: 4 },
  { id: 'm3', name: 'Basics', vmp: 10 },
  { id: 'm4', name: 'Couro Fino', vmp: 2 },
]

let manufacturers = [...DEFAULT_MANUFACTURERS]
try {
  const stored = localStorage.getItem('vmoda_manufacturers')
  if (stored) {
    manufacturers = JSON.parse(stored)
  }
} catch (e) {
  // ignore
}

const listeners = new Set<() => void>()
function notify() {
  localStorage.setItem('vmoda_manufacturers', JSON.stringify(manufacturers))
  listeners.forEach((listener) => listener())
}

export function useManufacturerStore() {
  const [data, setData] = useState(manufacturers)

  useEffect(() => {
    const listener = () => setData([...manufacturers])
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  const updateVmp = (id: string, vmp: number) => {
    const index = manufacturers.findIndex((m) => m.id === id)
    if (index !== -1) {
      manufacturers[index].vmp = vmp
      notify()
    }
  }

  const addManufacturer = (name: string, vmp: number) => {
    manufacturers.push({ id: `m${Date.now()}`, name, vmp })
    notify()
  }

  return { manufacturers: data, updateVmp, addManufacturer }
}
