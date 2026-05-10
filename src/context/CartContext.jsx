// context/CartContext.jsx
// Global shopping cart state

import { createContext, useContext, useState, useMemo } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState([])  // [{ item, qty }]

  const add = (item) => {
    setItems(prev => {
      const existing = prev.find(c => c.item.id === item.id)
      if (existing) return prev.map(c => c.item.id === item.id ? { ...c, qty: c.qty + 1 } : c)
      return [...prev, { item, qty: 1 }]
    })
  }

  const remove = (id) => setItems(prev => prev.filter(c => c.item.id !== id))

  const updateQty = (id, qty) => {
    if (qty <= 0) { remove(id); return }
    setItems(prev => prev.map(c => c.item.id === id ? { ...c, qty } : c))
  }

  const clear = () => setItems([])

  const total = useMemo(() => items.reduce((s, c) => s + c.item.price * c.qty, 0), [items])
  const count = useMemo(() => items.reduce((s, c) => s + c.qty, 0), [items])

  return (
    <CartContext.Provider value={{ items, add, remove, updateQty, clear, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
