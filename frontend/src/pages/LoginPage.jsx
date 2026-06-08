import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { setUser } = useAuth()

  const handleSubmit = () => {
    setError('')

    if (!form.email || !form.password) {
      setError('Please fill in all fields.')
      return
    }

    if (!isLogin && !form.name) {
      setError('Please enter your name.')
      return
    }

    if (isLogin) {
      const users = JSON.parse(localStorage.getItem('fm_users') || '[]')
      const user = users.find(u => u.email === form.email && u.password === form.password)
      if (!user) {
        setError('Invalid email or password.')
        return
      }
      localStorage.setItem('fm_current_user', JSON.stringify(user))
      setUser(user)
      navigate('/home')
    } else {
      const users = JSON.parse(localStorage.getItem('fm_users') || '[]')
      const exists = users.find(u => u.email === form.email)
      if (exists) {
        setError('An account with this email already exists.')
        return
      }
      const newUser = {
        id: Date.now(),
        name: form.name,
        email: form.email,
        password: form.password,
      }
      users.push(newUser)
      localStorage.setItem('fm_users', JSON.stringify(users))
      localStorage.setItem('fm_current_user', JSON.stringify(newUser))
      setUser(newUser)
      navigate('/home')
    }
  }

  return (
    <div style={{
      minHeight:'100vh', background:'linear-gradient(135deg, #f97316, #ef4444)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:'20px'
    }}>
      <div style={{
        background:'white', borderRadius:'24px', padding:'48px 40px',
        width:'100%', maxWidth:'420px', boxShadow:'0 20px 60px rgba(0,0,0,0.15)'
      }}>
        {/* Back to landing */}
        <button
          onClick={() => navigate('/')}
          style={{
            background:'none', border:'none', color:'#888', fontSize:'13px',
            cursor:'pointer', marginBottom:'24px', padding:'0', display:'flex',
            alignItems:'center', gap:'4px'
          }}
        >
          ← Back to home
        </button>

        {/* Logo */}
        <div style={{textAlign:'center', marginBottom:'32px'}}>
          <p style={{fontSize:'36px'}}>🍽️</p>
          <h1 style={{fontSize:'28px', fontWeight:'bold', color:'#f97316'}}>FlavorMind</h1>
          <p style={{color:'#888', fontSize:'14px', marginTop:'4px'}}>
            Discover recipes you'll love
          </p>
        </div>

        {/* Toggle */}
        <div style={{
          display:'flex', background:'#f1f5f9', borderRadius:'12px',
          padding:'4px', marginBottom:'28px'
        }}>
          {['Login', 'Sign Up'].map((label, i) => (
            <button
              key={label}
              onClick={() => { setIsLogin(i === 0); setError('') }}
              style={{
                flex:1, padding:'10px', borderRadius:'10px', border:'none',
                fontWeight:'600', fontSize:'14px', cursor:'pointer',
                background: (isLogin ? i === 0 : i === 1) ? 'white' : 'transparent',
                color: (isLogin ? i === 0 : i === 1) ? '#f97316' : '#888',
                boxShadow: (isLogin ? i === 0 : i === 1) ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                transition:'all 0.2s'
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Form */}
        {!isLogin && (
          <input
            className="input"
            type="text"
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm({...form, name: e.target.value})}
          />
        )}
        <input
          className="input"
          type="email"
          placeholder="Email address"
          value={form.email}
          onChange={(e) => setForm({...form, email: e.target.value})}
        />
        <input
          className="input"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({...form, password: e.target.value})}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />

        {error && (
          <p style={{color:'#ef4444', fontSize:'13px', marginBottom:'16px', marginTop:'-8px'}}>
            ⚠️ {error}
          </p>
        )}

        <button className="btn" onClick={handleSubmit}>
          {isLogin ? 'Login' : 'Create Account'}
        </button>

        <p style={{textAlign:'center', fontSize:'13px', color:'#888', marginTop:'20px'}}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span
            onClick={() => { setIsLogin(!isLogin); setError('') }}
            style={{color:'#f97316', cursor:'pointer', fontWeight:'600'}}
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </span>
        </p>
      </div>
    </div>
  )
}