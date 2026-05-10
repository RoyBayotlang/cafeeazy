// pages/AuthPage.jsx
// Login + Register page. Tabs to switch between modes.

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabase'
import { useAuth } from '../context/AuthContext'

export default function AuthPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab]         = useState('login')
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [password, setPass]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')

  // If already logged in, go to dashboard
  if (user) { navigate('/dashboard'); return null }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    navigate('/dashboard')
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!name.trim()) { setError('Please enter your full name'); return }
    setError(''); setLoading(true)
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name } }
    })
    if (error) { setError(error.message); setLoading(false); return }
    setSuccess('Account created! You can now sign in.')
    setTab('login')
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <span className="auth-logo">☕</span>
          <h1>CafeEazy</h1>
          <p>Order campus meals online.<br/>Skip the line. Save your time.</p>
          <ul className="auth-features">
            <li>🍱 Browse the full menu</li>
            <li>🛒 Order from anywhere</li>
            <li>🔔 Get notified when ready</li>
            <li>🎉 No more waiting in line</li>
          </ul>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h2>{tab === 'login' ? 'Welcome back!' : 'Create account'}</h2>
          <p className="auth-sub">
            {tab === 'login' ? 'Sign in to your CafeEazy account' : 'Join CafeEazy today'}
          </p>

          <div className="tabs">
            <button className={tab === 'login' ? 'tab active' : 'tab'} onClick={() => { setTab('login'); setError(''); setSuccess('') }}>Sign In</button>
            <button className={tab === 'register' ? 'tab active' : 'tab'} onClick={() => { setTab('register'); setError(''); setSuccess('') }}>Sign Up</button>
          </div>

          {error   && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {tab === 'login' ? (
            <form onSubmit={handleLogin}>
              <div className="field">
                <label>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" required />
              </div>
              <div className="field">
                <label>Password</label>
                <input type="password" value={password} onChange={e => setPass(e.target.value)} placeholder="••••••••" required />
              </div>
              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <div className="field">
                <label>Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Juan dela Cruz" required />
              </div>
              <div className="field">
                <label>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" required />
              </div>
              <div className="field">
                <label>Password <span className="hint">(min 6 characters)</span></label>
                <input type="password" value={password} onChange={e => setPass(e.target.value)} placeholder="••••••••" required minLength={6} />
              </div>
              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
