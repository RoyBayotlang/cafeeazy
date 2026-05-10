// pages/CartPage.jsx
// Review cart and place order. Saves order directly to Supabase.

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../utils/supabase'

export default function CartPage() {
  const { items, remove, updateQty, clear, total } = useCart()
  const { user }   = useAuth()
  const navigate   = useNavigate()
  const [note, setNote]       = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleOrder = async () => {
    if (items.length === 0) return
    setLoading(true); setError('')

    try {
      // 1. Count today's orders for queue number
      const todayStart = new Date(); todayStart.setHours(0,0,0,0)
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayStart.toISOString())

      const queueNumber = (count || 0) + 1

      // 2. Insert the order
      const { data: order, error: oErr } = await supabase
        .from('orders')
        .insert({
          user_id:      user.id,
          total_amount: total,
          note:         note || null,
          queue_number: queueNumber,
          status:       'pending'
        })
        .select()
        .single()

      if (oErr) throw oErr

      // 3. Insert order items
      const orderItems = items.map(c => ({
        order_id:     order.id,
        menu_item_id: c.item.id,
        quantity:     c.qty,
        unit_price:   c.item.price
      }))

      const { error: iErr } = await supabase.from('order_items').insert(orderItems)
      if (iErr) throw iErr

      clear()
      navigate('/orders')
    } catch (err) {
      setError('Failed to place order: ' + err.message)
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <nav className="navbar">
        <span className="navbar-brand">☕ CafeEazy</span>
        <button className="nav-link" onClick={() => navigate('/dashboard')}>← Back to Menu</button>
      </nav>

      <div className="container container-narrow">
        <h1 className="page-title">🛒 Your Cart</h1>

        {items.length === 0 ? (
          <div className="empty">
            <p>Your cart is empty.</p>
            <button className="btn-primary" onClick={() => navigate('/dashboard')}>Browse Menu</button>
          </div>
        ) : (
          <>
            <div className="cart-list">
              {items.map(({ item, qty }) => (
                <div key={item.id} className="cart-item">
                  <div className="cart-info">
                    <p className="cart-name">{item.name}</p>
                    <p className="cart-unit">₱{Number(item.price).toFixed(2)} each</p>
                  </div>
                  <div className="qty-ctrl">
                    <button onClick={() => updateQty(item.id, qty - 1)}>−</button>
                    <span>{qty}</span>
                    <button onClick={() => updateQty(item.id, qty + 1)}>+</button>
                  </div>
                  <span className="cart-sub">₱{(item.price * qty).toFixed(2)}</span>
                  <button className="cart-remove" onClick={() => remove(item.id)}>✕</button>
                </div>
              ))}
            </div>

            <div className="field" style={{marginBottom: '16px'}}>
              <label>Special Instructions (optional)</label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="e.g. No onions, less rice..."
                rows={3}
              />
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="cart-summary">
              <div className="summary-row total-row">
                <span>Total</span>
                <span>₱{total.toFixed(2)}</span>
              </div>
            </div>

            <div className="cart-actions">
              <button className="btn-outline" onClick={() => navigate('/dashboard')}>← Continue Shopping</button>
              <button className="btn-primary" onClick={handleOrder} disabled={loading}>
                {loading ? 'Placing Order...' : '🍱 Place Order'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
