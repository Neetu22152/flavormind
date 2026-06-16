import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const BASE_URL = 'http://localhost:5000'

export default function AdminPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('stats')
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/home')
      return
    }
    fetchStats()
    fetchUsers()
    fetchRecipes()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await axios.get(BASE_URL + '/api/admin/stats?email=' + user.email)
      setStats(res.data)
    } catch (err) { console.error(err) }
  }

  const fetchUsers = async () => {
    try {
      const res = await axios.get(BASE_URL + '/api/admin/users?email=' + user.email)
      setUsers(res.data.users || [])
    } catch (err) { console.error(err) }
  }

  const fetchRecipes = async () => {
    try {
      const res = await axios.get(BASE_URL + '/api/admin/recipes?email=' + user.email)
      setRecipes(res.data.recipes || [])
    } catch (err) { console.error(err) }
  }

  const handleDeleteRecipe = async (recipeId) => {
    if (!window.confirm('Delete this recipe?')) return
    try {
      await axios.delete(BASE_URL + '/api/admin/recipes/' + recipeId + '?email=' + user.email)
      setRecipes(prev => prev.filter(r => r.id !== recipeId))
      fetchStats()
    } catch (err) { console.error(err) }
  }

  const handleDeleteUser = async (userEmail) => {
    if (!window.confirm('Delete user ' + userEmail + '? This will delete all their data!')) return
    try {
      await axios.delete(BASE_URL + '/api/admin/users/' + userEmail + '?email=' + user.email)
      setUsers(prev => prev.filter(u => u.email !== userEmail))
      fetchStats()
    } catch (err) { console.error(err) }
  }

  const TABS = [
    { id: 'stats', label: '📊 Overview' },
    { id: 'users', label: '👥 Users' },
    { id: 'recipes', label: '🍽️ Recipes' },
  ]

  return (
    <div style={{minHeight:'100vh', background:'#f8fafc'}}>
      {/* Admin Navbar */}
      <nav style={{
        background:'#1e293b', padding:'16px 32px',
        display:'flex', justifyContent:'space-between', alignItems:'center'
      }}>
        <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
          <span style={{fontSize:'20px', fontWeight:'bold', color:'white'}}>
            🍽️ FlavorMind
          </span>
          <span style={{
            background:'#f97316', color:'white', padding:'2px 10px',
            borderRadius:'999px', fontSize:'12px', fontWeight:'600'
          }}>
            Admin
          </span>
        </div>
        <button
          onClick={() => { logout(); navigate('/') }}
          style={{
            background:'#ef4444', color:'white', border:'none',
            padding:'8px 16px', borderRadius:'8px', fontSize:'13px',
            fontWeight:'600', cursor:'pointer'
          }}
        >
          Logout
        </button>
      </nav>

      <div style={{maxWidth:'1100px', margin:'0 auto', padding:'32px'}}>
        <h1 style={{fontSize:'28px', fontWeight:'bold', color:'#1e293b', marginBottom:'8px'}}>
          Admin Dashboard
        </h1>
        <p style={{color:'#888', marginBottom:'32px'}}>Manage users, recipes and platform content</p>

        {/* Tabs */}
        <div style={{display:'flex', gap:'8px', marginBottom:'28px'}}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding:'10px 20px', borderRadius:'10px', border:'none',
                fontWeight:'600', fontSize:'14px', cursor:'pointer',
                background: activeTab === tab.id ? '#1e293b' : 'white',
                color: activeTab === tab.id ? 'white' : '#555',
                boxShadow:'0 2px 8px rgba(0,0,0,0.08)'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Stats Tab */}
        {activeTab === 'stats' && stats && (
          <div>
            <div style={{
              display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))',
              gap:'20px', marginBottom:'32px'
            }}>
              {[
                { label: 'Total Users', value: stats.total_users, icon: '👥', color: '#3b82f6' },
                { label: 'Uploaded Recipes', value: stats.total_uploaded_recipes, icon: '🍽️', color: '#f97316' },
                { label: 'Saved Recipes', value: stats.total_saved_recipes, icon: '❤️', color: '#ef4444' },
                { label: 'Total Reviews', value: stats.total_reviews, icon: '⭐', color: '#f59e0b' },
              ].map(s => (
                <div key={s.label} style={{
                  background:'white', borderRadius:'16px', padding:'24px',
                  boxShadow:'0 2px 12px rgba(0,0,0,0.06)',
                  borderLeft:'4px solid ' + s.color
                }}>
                  <p style={{fontSize:'32px', marginBottom:'4px'}}>{s.icon}</p>
                  <p style={{fontSize:'32px', fontWeight:'bold', color:s.color}}>{s.value}</p>
                  <p style={{color:'#888', fontSize:'14px'}}>{s.label}</p>
                </div>
              ))}
            </div>

            <div style={{
              background:'white', borderRadius:'16px', padding:'24px',
              boxShadow:'0 2px 12px rgba(0,0,0,0.06)'
            }}>
              <h2 style={{fontSize:'18px', fontWeight:'bold', color:'#1e293b', marginBottom:'16px'}}>
                Platform Summary
              </h2>
              <p style={{color:'#555', lineHeight:'1.8'}}>
                FlavorMind has <strong>{stats.total_users}</strong> registered users who have uploaded <strong>{stats.total_uploaded_recipes}</strong> community recipes,
                saved <strong>{stats.total_saved_recipes}</strong> recipes to their collections,
                and written <strong>{stats.total_reviews}</strong> reviews.
              </p>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <p style={{color:'#888', marginBottom:'20px', fontSize:'14px'}}>
              {users.length} registered users
            </p>
            {users.length === 0 ? (
              <div style={{textAlign:'center', padding:'60px', color:'#888'}}>
                <p style={{fontSize:'40px', marginBottom:'12px'}}>👥</p>
                <p>No users registered yet</p>
              </div>
            ) : (
              <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
                {users.map(u => (
                  <div key={u.email} style={{
                    background:'white', borderRadius:'14px', padding:'20px',
                    boxShadow:'0 2px 8px rgba(0,0,0,0.06)',
                    display:'flex', justifyContent:'space-between', alignItems:'center',
                    flexWrap:'wrap', gap:'12px'
                  }}>
                    <div style={{display:'flex', alignItems:'center', gap:'14px'}}>
                      <div style={{
                        width:'44px', height:'44px', borderRadius:'50%',
                        background:'linear-gradient(135deg, #f97316, #ef4444)',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        color:'white', fontWeight:'bold', fontSize:'18px'
                      }}>
                        {u.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p style={{fontWeight:'600', color:'#1e293b', fontSize:'15px'}}>
                          {u.profile?.name || u.email.split('@')[0]}
                        </p>
                        <p style={{color:'#888', fontSize:'13px'}}>{u.email}</p>
                      </div>
                    </div>
                    <div style={{display:'flex', gap:'20px', alignItems:'center'}}>
                      <div style={{textAlign:'center'}}>
                        <p style={{fontWeight:'bold', color:'#f97316'}}>{u.recipe_count}</p>
                        <p style={{fontSize:'12px', color:'#888'}}>Recipes</p>
                      </div>
                      <div style={{textAlign:'center'}}>
                        <p style={{fontWeight:'bold', color:'#ef4444'}}>{u.saved_count}</p>
                        <p style={{fontSize:'12px', color:'#888'}}>Saved</p>
                      </div>
                      <button
                        onClick={() => handleDeleteUser(u.email)}
                        style={{
                          background:'#fef2f2', color:'#dc2626', border:'1px solid #fecaca',
                          padding:'6px 14px', borderRadius:'8px', fontSize:'12px',
                          fontWeight:'600', cursor:'pointer'
                        }}
                      >
                        Delete User
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Recipes Tab */}
        {activeTab === 'recipes' && (
          <div>
            <p style={{color:'#888', marginBottom:'20px', fontSize:'14px'}}>
              {recipes.length} community uploaded recipes
            </p>
            {recipes.length === 0 ? (
              <div style={{textAlign:'center', padding:'60px', color:'#888'}}>
                <p style={{fontSize:'40px', marginBottom:'12px'}}>🍽️</p>
                <p>No community recipes uploaded yet</p>
              </div>
            ) : (
              <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
                {recipes.map(recipe => (
                  <div key={recipe.id} style={{
                    background:'white', borderRadius:'14px', padding:'20px',
                    boxShadow:'0 2px 8px rgba(0,0,0,0.06)',
                    display:'flex', justifyContent:'space-between', alignItems:'center',
                    flexWrap:'wrap', gap:'12px'
                  }}>
                    <div>
                      <p style={{fontWeight:'600', color:'#1e293b', fontSize:'15px', textTransform:'capitalize', marginBottom:'4px'}}>
                        {recipe.name}
                      </p>
                      <p style={{color:'#888', fontSize:'13px'}}>
                        By {recipe.author?.split('@')[0]} · ⏱️ {recipe.minutes} mins · 🥘 {recipe.ingredients?.length} ingredients
                      </p>
                      {recipe.created_at && (
                        <p style={{color:'#aaa', fontSize:'12px', marginTop:'2px'}}>
                          Uploaded: {new Date(recipe.created_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteRecipe(recipe.id)}
                      style={{
                        background:'#fef2f2', color:'#dc2626', border:'1px solid #fecaca',
                        padding:'6px 14px', borderRadius:'8px', fontSize:'12px',
                        fontWeight:'600', cursor:'pointer'
                      }}
                    >
                      Delete Recipe
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}