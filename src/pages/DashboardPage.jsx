// pages/DashboardPage.jsx
// Main menu page. Fetches directly from Supabase — no backend needed.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

// Fallback food image
const PLACEHOLDER = "https://placehold.co/400x260/f97316/ffffff?text=🍽️";

// ── Hardcoded image mapping by item ID ──────────────────────────
// Put your images in public/images/ folder
// Example: public/images/cappuccino.jpg → reference as "/images/cappuccino.jpg"
const imageMap = {
     1: "https://zwcfoznwempfkovxareh.supabase.co/storage/v1/object/public/food-images/pork-adoborice.jpg",
   2: "https://zwcfoznwempfkovxareh.supabase.co/storage/v1/object/public/food-images/chicken%20tinola.jpg",
   3: "https://zwcfoznwempfkovxareh.supabase.co/storage/v1/object/public/food-images/beef%20sinigang.jpg",
   4: "https://zwcfoznwempfkovxareh.supabase.co/storage/v1/object/public/food-images/pinakbet.jpg",
   5: "https://zwcfoznwempfkovxareh.supabase.co/storage/v1/object/public/food-images/french%20fries.jpg",
   6: "https://zwcfoznwempfkovxareh.supabase.co/storage/v1/object/public/food-images/hotdog%20sandwich.jpg",
   7: "https://zwcfoznwempfkovxareh.supabase.co/storage/v1/object/public/food-images/kikiam.jpg",
   8: "https://zwcfoznwempfkovxareh.supabase.co/storage/v1/object/public/food-images/iced%20tea.jpg",
   9: "https://zwcfoznwempfkovxareh.supabase.co/storage/v1/object/public/food-images/bottled%20water.jpg",
   10: "https://zwcfoznwempfkovxareh.supabase.co/storage/v1/object/public/food-images/fruit%20shake.jpg",
   11: "https://zwcfoznwempfkovxareh.supabase.co/storage/v1/object/public/food-images/softdrinks.jpg",
   12: "https://zwcfoznwempfkovxareh.supabase.co/storage/v1/object/public/food-images/maja%20blanca.jpg",
   13: "https://zwcfoznwempfkovxareh.supabase.co/storage/v1/object/public/food-images/biko.jpg",
   
  // Add your item ID: image path mappings here
};

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const { add, count, total } = useCart();
  const navigate = useNavigate();

  const [menu, setMenu] = useState([]);
  const [cats, setCats] = useState([]);
  const [activeCat, setActiveCat] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  // Get user's first name for greeting
  const firstName =
    user?.user_metadata?.full_name?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "there";

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  // ── Fetch menu + categories directly from Supabase ──────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const [{ data: menuData }, { data: catData }] = await Promise.all([
        supabase
          .from("menu_items")
          .select("*, categories(id, name, icon)")
          .eq("is_available", true)
          .order("category_id"),
        supabase.from("categories").select("*").order("id"),
      ]);

      setMenu(menuData || []);
      setCats(catData || []);
      setLoading(false);
    };
    load();
  }, []);

  // ── Filter by category + search ─────────────────────────────────
  const filtered = menu.filter((item) => {
    const matchCat = activeCat === null || item.categories?.id === activeCat;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleAdd = (item) => {
    add(item);
    setToast(`${item.name} added!`);
    setTimeout(() => setToast(""), 2000);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="page">
      {/* ── Navbar ── */}
      <nav className="navbar">
        <span className="navbar-brand">☕ CafeEazy</span>
        <div className="navbar-links">
          <button className="nav-link active">Menu</button>
          <button className="nav-link" onClick={() => navigate("/orders")}>
            My Orders
          </button>
        </div>
        <div className="navbar-right">
          <button className="cart-btn" onClick={() => navigate("/cart")}>
            🛒 {count > 0 && <span className="cart-badge">{count}</span>}
          </button>
          <span className="nav-user">👤 {firstName}</span>
          <button className="btn-outline-sm" onClick={handleSignOut}>
            Logout
          </button>
        </div>
      </nav>

      <div className="container">
        {/* ── Hero ── */}
        <div className="hero">
          <h1>
            {greeting}, {firstName}! 👋
          </h1>
          <p>What would you like to eat today?</p>
        </div>

        {/* ── Search ── */}
        <input
          className="search-input"
          type="text"
          placeholder="🔍  Search food or drinks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* ── Category tabs ── */}
        <div className="cat-tabs">
          <button
            className={activeCat === null ? "cat-tab active" : "cat-tab"}
            onClick={() => setActiveCat(null)}
          >
            🍽️ All
          </button>
          {cats.map((c) => (
            <button
              key={c.id}
              className={activeCat === c.id ? "cat-tab active" : "cat-tab"}
              onClick={() => setActiveCat(c.id)}
            >
              {c.icon} {c.name}
            </button>
          ))}
        </div>

        {/* ── Menu grid ── */}
        {loading ? (
          <div className="menu-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card skeleton" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty">😕 No items found.</div>
        ) : (
          <div className="menu-grid">
            {filtered.map((item) => (
              <div key={item.id} className="card">
                <div className="card-img-wrap">
                  <img
                    src={imageMap[item.id] || item.image_url || PLACEHOLDER}
                    alt={item.name}
                    onError={(e) => {
                      e.target.src = PLACEHOLDER;
                    }}
                  />
                  {item.categories && (
                    <span className="cat-pill">
                      {item.categories.icon} {item.categories.name}
                    </span>
                  )}
                </div>
                <div className="card-body">
                  <h3>{item.name}</h3>
                  <p className="card-desc">
                    {item.description || "Campus cafeteria special."}
                  </p>
                  <div className="card-footer">
                    <span className="price">
                      ₱{Number(item.price).toFixed(2)}
                    </span>
                    <button className="btn-add" onClick={() => handleAdd(item)}>
                      + Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Floating cart ── */}
      {count > 0 && (
        <button className="float-cart" onClick={() => navigate("/cart")}>
          🛒 View Cart ({count} items) — ₱{total.toFixed(2)}
        </button>
      )}

      {/* ── Toast ── */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
