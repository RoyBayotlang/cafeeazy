// App.jsx — Router setup. ProtectedRoute redirects if not logged in.

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import AuthPage      from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import CartPage      from './pages/CartPage'
import OrdersPage    from './pages/OrdersPage'

// Waits for Supabase session check, then redirects if not logged in
function Protected({ children }) {
  const { user, ready } = useAuth()
  if (!ready) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',flexDirection:'column',gap:'16px'}}>
      <div className="spinner" />
      <p style={{color:'#64748b',fontFamily:'sans-serif'}}>Loading...</p>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/login"     element={<AuthPage />} />
            <Route path="/dashboard" element={<Protected><DashboardPage /></Protected>} />
            <Route path="/cart"      element={<Protected><CartPage /></Protected>} />
            <Route path="/orders"    element={<Protected><OrdersPage /></Protected>} />
            <Route path="*"          element={<Navigate to="/login" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
