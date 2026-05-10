// pages/DashboardPage.jsx
// Main menu page. Fetches directly from Supabase — no backend needed.

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabase'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

// Fallback food image
const PLACEHOLDER = 'https://placehold.co/400x260/f97316/ffffff?text=🍽️'

// ============================================================
// DIRI KA MAG BUTANG UG IMAGES BAI
// Example:
// const FOOD_IMAGES = {
//   'Pork Adobo + Rice':  'https://your-image-url.com/adobo.jpg',
//   'Chicken Tinola':     'https://your-image-url.com/tinola.jpg',
//   'Beef Sinigang':      'https://your-image-url.com/sinigang.jpg',
//   'Pinakbet':           'https://your-image-url.com/pinakbet.jpg',
//   'French Fries':       'https://your-image-url.com/fries.jpg',
//   'Hotdog Sandwich':    'https://your-image-url.com/hotdog.jpg',
//   'Kikiam':             'https://your-image-url.com/kikiam.jpg',
//   'Iced Tea':           'https://your-image-url.com/icedtea.jpg',
//   'Bottled Water':      'https://your-image-url.com/water.jpg',
//   'Fruit Shake':        'https://your-image-url.com/shake.jpg',
//   'Softdrinks':         'https://your-image-url.com/softdrinks.jpg',
//   'Maja Blanca':        'https://your-image-url.com/maja.jpg',
//   'Biko':               'https://your-image-url.com/biko.jpg',
// }
// ============================================================
const FOOD_IMAGES = {
  // paste your image URLs here bai!
}

export default function DashboardPage() {
  const { user, signOut }     = useAuth()
  const { add, count, total } = useCart()
  const navigate              = useNavigate()

  const [menu,      setMenu]      = useState([])
  const [cats,      setCats]      = useState([])
  const [activeCat, setActiveCat] = useState(null)
  const [search,    setSearch]    = useState('')
  const [loading,   setLoading]   = useState(true)
  const [toast,     setToast]     = useState('')

  // Get user's first name for greeting
  const firstName = user?.user_metadata?.full_name?.split(' ')[0]
    || user?.email?.split('@')[0]
    || 'there'

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  // ── Fetch menu + categories directly from Supabase ──────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true)

      const [{ data: menuData }, { data: catData }] = await Promise.all([
        supabase
          .from('menu_items')
          .select('*, categories(id, name, icon)')
          .eq('is_available', true)
          .order('category_id'),
        supabase
          .from('categories')
          .select('*')
          .order('id')
      ])

      setMenu(menuData || [])
      setCats(catData || [])
      setLoading(false)
    }
    load()
  }, [])

  // ── Filter by category + search ─────────────────────────────────
  const filtered = menu.filter(item => {
    const matchCat    = activeCat === null || item.categories?.id === activeCat
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const handleAdd = (item) => {
    add(item)
    setToast(`${item.name} added!`)
    setTimeout(() => setToast(''), 2000)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="page">
      {/* ── Navbar ── */}
      <nav className="navbar">
        <span className="navbar-brand">☕ CafeEazy</span>
        <div className="navbar-links">
          <button className="nav-link active">Menu</button>
          <button className="nav-link" onClick={() => navigate('/orders')}>My Orders</button>
        </div>
        <div className="navbar-right">
          <button className="cart-btn" onClick={() => navigate('/cart')}>
            🛒 {count > 0 && <span className="cart-badge">{count}</span>}
          </button>
          <span className="nav-user">👤 {firstName}</span>
          <button className="btn-outline-sm" onClick={handleSignOut}>Logout</button>
        </div>
      </nav>

      <div className="container">
        {/* ── Hero ── */}
        <div className="hero">
          <h1>{greeting}, {firstName}! 👋</h1>
          <p>What would you like to eat today?</p>
        </div>

        {/* ── Search ── */}
        <input
          className="search-input"
          type="text"
          placeholder="🔍  Search food or drinks..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {/* ── Category tabs ── */}
        <div className="cat-tabs">
          <button className={activeCat === null ? 'cat-tab active' : 'cat-tab'} onClick={() => setActiveCat(null)}>
            🍽️ All
          </button>
          {cats.map(c => (
            <button
              key={c.id}
              className={activeCat === c.id ? 'cat-tab active' : 'cat-tab'}
              onClick={() => setActiveCat(c.id)}
            >
              {c.icon} {c.name}
            </button>
          ))}
        </div>

        {/* ── Menu grid ── */}
        {loading ? (
          <div className="menu-grid">
            {[...Array(6)].map((_, i) => <div key={i} className="card skeleton" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty">😕 No items found.</div>
        ) : (
          <div className="menu-grid">
            {filtered.map(item => (
              <div key={item.id} className="card">
                <div className="card-img-wrap">
                  <img
                    {/* FOOD_IMAGES[item.name] = tan-awa ang FOOD_IMAGES sa itaas bai
                        kung walay image sa FOOD_IMAGES, kuhaon ang image_url gikan Supabase
                        kung walay image_url, ipakita ang PLACEHOLDER */}
                    src={FOOD_IMAGES[item.name] || item.image_url || PLACEHOLDER}
                    alt={item.name}
                    onError={e => { e.target.src = PLACEHOLDER }}
                  />
                  {item.categories && (
                    <span className="cat-pill">{item.categories.icon} {item.categories.name}</span>
                  )}
                </div>
                <div className="card-body">
                  <h3>{item.name}</h3>
                  <p className="card-desc">{item.description || 'Campus cafeteria special.'}</p>
                  <div className="card-footer">
                    <span className="price">₱{Number(item.price).toFixed(2)}</span>
                    <button className="btn-add" onClick={() => handleAdd(item)}>+ Add</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Floating cart ── */}
      {count > 0 && (
        <button className="float-cart" onClick={() => navigate('/cart')}>
          🛒 View Cart ({count} items) — ₱{total.toFixed(2)}
        </button>
      )}

      {/* ── Toast ── */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
