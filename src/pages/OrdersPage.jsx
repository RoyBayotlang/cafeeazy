// pages/OrdersPage.jsx
// Shows all orders with live status. Auto-refreshes every 15 seconds.

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabase'
import { useAuth } from '../context/AuthContext'

// Status config: label, color class, description
const STATUS = {
  pending:   { label: '⏳ Pending',          cls: 'status-pending',   desc: 'Waiting for cafeteria to confirm' },
  confirmed: { label: '✅ Confirmed',         cls: 'status-confirmed', desc: 'Cafeteria accepted your order' },
  preparing: { label: '👨‍🍳 Preparing',        cls: 'status-preparing', desc: 'Your food is being cooked!' },
  ready:     { label: '🔔 Ready for Pickup!', cls: 'status-ready',     desc: 'Come to the counter now!' },
  collected: { label: '🎉 Collected',         cls: 'status-collected', desc: 'Enjoy your meal!' },
  cancelled: { label: '❌ Cancelled',         cls: 'status-cancelled', desc: 'This order was cancelled' },
}

export default function OrdersPage() {
  const { user, signOut } = useAuth()
  const navigate          = useNavigate()
  const [orders,   setOrders]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [expanded, setExpanded] = useState(new Set())

  // ── Fetch user's orders from Supabase ───────────────────────────
  const load = useCallback(async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id, status, total_amount, queue_number, note, created_at,
        order_items ( id, quantity, unit_price, subtotal, menu_items(name) )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error) setOrders(data || [])
    setLoading(false)
  }, [user])

  // Load on mount + refresh every 15 seconds
  useEffect(() => {
    load()
    const interval = setInterval(load, 15000)
    return () => clearInterval(interval)
  }, [load])

  const toggleExpand = (id) => {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleCancel = async (id) => {
    if (!confirm('Cancel this order?')) return
    await supabase.from('orders').update({ status: 'cancelled' }).eq('id', id)
    load()
  }

  const fmt = (d) => new Date(d).toLocaleString('en-PH', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })

  const handleSignOut = async () => { await signOut(); navigate('/login') }

  return (
    <div className="page">
      <nav className="navbar">
        <span className="navbar-brand">☕ CafeEazy</span>
        <div className="navbar-links">
          <button className="nav-link" onClick={() => navigate('/dashboard')}>Menu</button>
          <button className="nav-link active">My Orders</button>
        </div>
        <div className="navbar-right">
          <button className="cart-btn" onClick={() => navigate('/cart')}>🛒</button>
          <button className="btn-outline-sm" onClick={handleSignOut}>Logout</button>
        </div>
      </nav>

      <div className="container container-narrow">
        <div className="page-header">
          <h1 className="page-title">📋 My Orders</h1>
          <button className="btn-outline-sm" onClick={load}>🔄 Refresh</button>
        </div>

        {loading ? (
          <div className="empty">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="empty">
            <p>You haven't placed any orders yet.</p>
            <button className="btn-primary" onClick={() => navigate('/dashboard')}>Browse Menu</button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => {
              const st = STATUS[order.status] || STATUS.pending
              const isExpanded = expanded.has(order.id)
              return (
                <div key={order.id} className={`order-card ${order.status === 'ready' ? 'order-ready' : ''}`}>
                  {/* Header */}
                  <div className="order-header">
                    <div className="order-meta">
                      <span className="queue-num">#{order.queue_number}</span>
                      <div>
                        <p className="order-date">{fmt(order.created_at)}</p>
                        <p className="order-total">₱{Number(order.total_amount).toFixed(2)}</p>
                      </div>
                    </div>
                    <span className={`status-badge ${st.cls}`}>{st.label}</span>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="order-details">
                      {order.order_items?.map(it => (
                        <div key={it.id} className="order-line">
                          <span>{it.menu_items?.name}</span>
                          <span>x{it.quantity}</span>
                          <span>₱{Number(it.subtotal).toFixed(2)}</span>
                        </div>
                      ))}
                      {order.note && <p className="order-note">📝 {order.note}</p>}
                      <p className="status-desc">{st.desc}</p>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="order-footer">
                    <button className="btn-ghost-sm" onClick={() => toggleExpand(order.id)}>
                      {isExpanded ? '▲ Hide' : '▼ Details'}
                    </button>
                    {['pending', 'confirmed'].includes(order.status) && (
                      <button className="btn-danger-sm" onClick={() => handleCancel(order.id)}>
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Status legend */}
        <div className="legend">
          <h3>Order Status Guide</h3>
          {Object.entries(STATUS).filter(([k]) => k !== 'cancelled').map(([key, val]) => (
            <div key={key} className="legend-row">
              <span className={`status-badge ${val.cls}`} style={{fontSize:'11px',padding:'3px 10px'}}>{val.label}</span>
              <span className="legend-desc">{val.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
