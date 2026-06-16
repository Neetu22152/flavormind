import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <nav className="navbar">
      <Link to={user?.role === 'admin' ? '/admin' : '/home'} className="navbar-brand">
        🍽️ FlavorMind
      </Link>
      <div className="navbar-links">
        {user?.role === 'admin' ? (
          <>
            <Link to="/admin">Admin Dashboard</Link>
            <button
              onClick={logout}
              style={{
                background:'#fef2f2', color:'#dc2626', border:'1px solid #fecaca',
                padding:'6px 14px', borderRadius:'8px', fontSize:'13px',
                fontWeight:'600', cursor:'pointer'
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/home">Home</Link>
            <Link to="/explore">Explore</Link>
            <Link to="/personal">For You</Link>
            <Link to="/dashboard">Dashboard</Link>
            {user && (
              <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                <span style={{color:'#f97316', fontWeight:'600', fontSize:'14px'}}>
                  👋 {user.name}
                </span>
                <button
                  onClick={logout}
                  style={{
                    background:'#fff7ed', color:'#f97316', border:'1px solid #fed7aa',
                    padding:'6px 14px', borderRadius:'8px', fontSize:'13px',
                    fontWeight:'600', cursor:'pointer'
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </nav>
  )
}