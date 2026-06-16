import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import axios from 'axios'
import {
  getSavedRecipes, getMyRecipes, uploadRecipe,
  deleteMyRecipe, editMyRecipe, updateProfile, unsaveRecipe
} from '../utils/api'
import { getFoodImage } from '../utils/api'

const BASE_URL = 'http://localhost:5000'

function SavedCard({ recipe, onUnsave }) {
  const [image, setImage] = useState(null)
  useEffect(() => {
    getFoodImage(recipe.name).then(url => setImage(url))
  }, [recipe.name])

  return (
    <div style={{background:'white', borderRadius:'16px', overflow:'hidden', boxShadow:'0 2px 12px rgba(0,0,0,0.08)', position:'relative'}}>
      <Link to={"/recipe/" + recipe.id}>
        <div style={{height:'140px', overflow:'hidden', background:'#fff7ed'}}>
          {image
            ? <img src={image} alt={recipe.name} style={{width:'100%', height:'100%', objectFit:'cover'}} />
            : <div style={{height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'40px'}}>🍽️</div>
          }
        </div>
        <div style={{padding:'14px'}}>
          <p style={{fontWeight:'600', color:'#1e293b', fontSize:'14px', textTransform:'capitalize', marginBottom:'6px'}}>{recipe.name}</p>
          <p style={{fontSize:'12px', color:'#888'}}>⏱️ {recipe.minutes} mins · 🥘 {recipe.ingredients?.length} ingredients</p>
        </div>
      </Link>
      <button
        onClick={() => onUnsave(recipe.id)}
        style={{position:'absolute', top:'8px', right:'8px', background:'rgba(0,0,0,0.5)', color:'white', border:'none', borderRadius:'50%', width:'28px', height:'28px', cursor:'pointer', fontSize:'14px', display:'flex', alignItems:'center', justifyContent:'center'}}
      >✕</button>
    </div>
  )
}

function MyRecipeCard({ recipe, onDelete, onEdit }) {
  const [image, setImage] = useState(null)

  useEffect(() => {
    fetch(BASE_URL + '/api/user/recipes/image/' + recipe.id)
      .then(res => {
        if (res.ok) setImage(BASE_URL + '/api/user/recipes/image/' + recipe.id)
      })
      .catch(() => {})
  }, [recipe.id])

  return (
    <div style={{background:'white', borderRadius:'16px', overflow:'hidden', boxShadow:'0 2px 12px rgba(0,0,0,0.08)', border:'1px solid #e2e8f0'}}>
      {image && <img src={image} alt={recipe.name} style={{width:'100%', height:'160px', objectFit:'cover'}} />}
      <div style={{padding:'20px'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'12px'}}>
          <h3 style={{fontWeight:'700', color:'#1e293b', fontSize:'15px', textTransform:'capitalize'}}>{recipe.name}</h3>
          <div style={{display:'flex', gap:'8px'}}>
            <button onClick={() => onEdit(recipe)} style={{background:'#eff6ff', color:'#2563eb', border:'none', padding:'4px 12px', borderRadius:'8px', fontSize:'12px', fontWeight:'600', cursor:'pointer'}}>Edit</button>
            <button onClick={() => onDelete(recipe.id)} style={{background:'#fef2f2', color:'#dc2626', border:'none', padding:'4px 12px', borderRadius:'8px', fontSize:'12px', fontWeight:'600', cursor:'pointer'}}>Delete</button>
          </div>
        </div>
        {recipe.description && <p style={{color:'#64748b', fontSize:'13px', marginBottom:'10px', lineHeight:'1.5'}}>{recipe.description}</p>}
        <div style={{display:'flex', gap:'16px', fontSize:'12px', color:'#888'}}>
          <span>⏱️ {recipe.minutes} mins</span>
          <span>🥘 {recipe.ingredients?.length} ingredients</span>
          <span>👨‍🍳 {recipe.steps?.length} steps</span>
        </div>
        <div style={{marginTop:'10px', display:'flex', flexWrap:'wrap', gap:'6px'}}>
          {recipe.ingredients?.slice(0, 4).map((ing, i) => (
            <span key={i} style={{background:'#fff7ed', color:'#f97316', padding:'2px 10px', borderRadius:'999px', fontSize:'11px', fontWeight:'500'}}>{ing}</span>
          ))}
          {recipe.ingredients?.length > 4 && <span style={{color:'#888', fontSize:'11px'}}>+{recipe.ingredients.length - 4} more</span>}
        </div>
      </div>
    </div>
  )
}

function RecipeModal({ recipe, onClose, onSave }) {
  const [form, setForm] = useState(recipe || {name:'', description:'', minutes:'', ingredients:'', steps:'', imagePreview:null, imageData:null})

  const handleSave = () => {
    if (!form.name.trim()) return
    onSave({
      ...form,
      minutes: parseInt(form.minutes) || 0,
      ingredients: typeof form.ingredients === 'string'
        ? form.ingredients.split(',').map(i => i.trim()).filter(Boolean)
        : form.ingredients,
      steps: typeof form.steps === 'string'
        ? form.steps.split('\n').map(s => s.trim()).filter(Boolean)
        : form.steps,
      image: form.imageData || null
    })
  }

  return (
    <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'20px'}}>
      <div style={{background:'white', borderRadius:'20px', padding:'32px', width:'100%', maxWidth:'560px', maxHeight:'90vh', overflowY:'auto'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px'}}>
          <h2 style={{fontSize:'20px', fontWeight:'bold', color:'#1e293b'}}>{recipe ? 'Edit Recipe' : 'Upload New Recipe'}</h2>
          <button onClick={onClose} style={{background:'none', border:'none', fontSize:'20px', cursor:'pointer', color:'#888'}}>✕</button>
        </div>

        <div style={{marginBottom:'16px'}}>
          <label style={{fontSize:'13px', fontWeight:'600', color:'#374151', display:'block', marginBottom:'6px'}}>Recipe Name *</label>
          <input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Grandma's Chocolate Cake" />
        </div>

        <div style={{marginBottom:'16px'}}>
          <label style={{fontSize:'13px', fontWeight:'600', color:'#374151', display:'block', marginBottom:'6px'}}>Recipe Photo (optional)</label>
          <div
            style={{border:'2px dashed #e2e8f0', borderRadius:'12px', padding:'20px', textAlign:'center', cursor:'pointer', background:'#f8fafc'}}
            onClick={() => document.getElementById('recipe-image-input').click()}
          >
            {form.imagePreview
              ? <img src={form.imagePreview} alt="preview" style={{width:'100%', maxHeight:'150px', objectFit:'cover', borderRadius:'8px'}} />
              : <div><p style={{fontSize:'32px', marginBottom:'8px'}}>📷</p><p style={{color:'#888', fontSize:'13px'}}>Click to upload photo</p></div>
            }
          </div>
          <input
            id="recipe-image-input"
            type="file"
            accept="image/*"
            style={{display:'none'}}
            onChange={(e) => {
              const file = e.target.files[0]
              if (!file) return
              const reader = new FileReader()
              reader.onload = (ev) => setForm({...form, imagePreview: ev.target.result, imageData: ev.target.result})
              reader.readAsDataURL(file)
            }}
          />
        </div>

        <div style={{marginBottom:'16px'}}>
          <label style={{fontSize:'13px', fontWeight:'600', color:'#374151', display:'block', marginBottom:'6px'}}>Description</label>
          <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Tell us about this recipe..." rows={3} style={{width:'100%', border:'1px solid #e2e8f0', borderRadius:'12px', padding:'12px 16px', fontSize:'14px', outline:'none', resize:'vertical', fontFamily:'sans-serif', boxSizing:'border-box'}} />
        </div>

        <div style={{marginBottom:'16px'}}>
          <label style={{fontSize:'13px', fontWeight:'600', color:'#374151', display:'block', marginBottom:'6px'}}>Cooking Time (minutes)</label>
          <input className="input" type="number" value={form.minutes} onChange={e => setForm({...form, minutes: e.target.value})} placeholder="e.g. 45" />
        </div>

        <div style={{marginBottom:'16px'}}>
          <label style={{fontSize:'13px', fontWeight:'600', color:'#374151', display:'block', marginBottom:'6px'}}>Ingredients (comma separated)</label>
          <textarea value={typeof form.ingredients === 'string' ? form.ingredients : form.ingredients?.join(', ')} onChange={e => setForm({...form, ingredients: e.target.value})} placeholder="flour, sugar, butter, eggs" rows={3} style={{width:'100%', border:'1px solid #e2e8f0', borderRadius:'12px', padding:'12px 16px', fontSize:'14px', outline:'none', resize:'vertical', fontFamily:'sans-serif', boxSizing:'border-box'}} />
        </div>

        <div style={{marginBottom:'24px'}}>
          <label style={{fontSize:'13px', fontWeight:'600', color:'#374151', display:'block', marginBottom:'6px'}}>Steps (one per line)</label>
          <textarea value={typeof form.steps === 'string' ? form.steps : form.steps?.join('\n')} onChange={e => setForm({...form, steps: e.target.value})} placeholder="Preheat oven to 350" rows={5} style={{width:'100%', border:'1px solid #e2e8f0', borderRadius:'12px', padding:'12px 16px', fontSize:'14px', outline:'none', resize:'vertical', fontFamily:'sans-serif', boxSizing:'border-box'}} />
        </div>

        <div style={{display:'flex', gap:'12px'}}>
          <button onClick={onClose} style={{flex:1, background:'#f1f5f9', color:'#555', border:'none', padding:'14px', borderRadius:'12px', fontSize:'15px', fontWeight:'600', cursor:'pointer'}}>Cancel</button>
          <button onClick={handleSave} style={{flex:1, background:'#f97316', color:'white', border:'none', padding:'14px', borderRadius:'12px', fontSize:'15px', fontWeight:'600', cursor:'pointer'}}>{recipe ? 'Save Changes' : 'Upload Recipe'}</button>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user, setUser, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('saved')
  const [savedRecipes, setSavedRecipes] = useState([])
  const [myRecipes, setMyRecipes] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState(null)
  const [profileForm, setProfileForm] = useState({name: user?.name || '', bio:''})
  const [profileSaved, setProfileSaved] = useState(false)

  useEffect(() => {
    fetchSaved()
    fetchMyRecipes()
  },[])
  useEffect(()=>{
    if (activeTab === 'saved') fetchSaved()
    if (activeTab === 'myrecipes') fetchMyRecipes()
  }, [activeTab])

  const fetchSaved = async () => {
    setLoading(true)
    try {
      const data = await getSavedRecipes(user.email)
      setSavedRecipes(data.saved_recipes || [])
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const fetchMyRecipes = async () => {
    setLoading(true)
    try {
      const data = await getMyRecipes(user.email)
      setMyRecipes(data.my_recipes || [])
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const handleUnsave = async (recipeId) => {
    await unsaveRecipe(user.email, recipeId)
    setSavedRecipes(prev => prev.filter(r => r.id !== recipeId))
  }

  const handleUpload = async (recipeData) => {
    const result = await uploadRecipe(user.email, recipeData)
    if (recipeData.image && result.recipe) {
      try {
        await axios.post(BASE_URL + '/api/user/recipes/image', {
          image: recipeData.image,
          recipe_id: result.recipe.id
        })
      } catch (err) { console.log('Image upload failed', err) }
    }
    setShowModal(false)
    await fetchMyRecipes()
  }

  const handleEdit = async (recipeData) => {
    await editMyRecipe(user.email, editingRecipe.id, recipeData)
    setEditingRecipe(null)
    fetchMyRecipes()
  }

  const handleDelete = async (recipeId) => {
    if (!window.confirm('Delete this recipe?')) return
    await deleteMyRecipe(user.email, recipeId)
    setMyRecipes(prev => prev.filter(r => r.id !== recipeId))
  }

  const handleProfileSave = async () => {
    await updateProfile(user.email, profileForm)
    const updatedUser = {...user, name: profileForm.name}
    localStorage.setItem('fm_current_user', JSON.stringify(updatedUser))
    setUser(updatedUser)
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 2000)
  }

  const TABS = [
    {id:'saved', label:'❤️ Saved Recipes'},
    {id:'myrecipes', label:'👨‍🍳 My Recipes'},
    {id:'profile', label:'👤 Profile'},
  ]

  return (
    <div style={{maxWidth:'1100px', margin:'0 auto', padding:'32px'}}>

      <div style={{background:'linear-gradient(135deg, #f97316, #ef4444)', borderRadius:'20px', padding:'32px', color:'white', marginBottom:'32px'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'16px'}}>
          <div>
            <h1 style={{fontSize:'28px', fontWeight:'bold', marginBottom:'6px'}}>👋 Welcome, {user?.name}!</h1>
            <p style={{opacity:'0.85', fontSize:'15px'}}>Manage your saved recipes, uploads and profile</p>
          </div>
          <div style={{display:'flex', gap:'16px', flexWrap:'wrap'}}>
            <div style={{textAlign:'center', background:'rgba(255,255,255,0.2)', borderRadius:'12px', padding:'12px 20px'}}>
              <p style={{fontSize:'24px', fontWeight:'bold'}}>{savedRecipes.length}</p>
              <p style={{fontSize:'12px', opacity:'0.85'}}>Saved</p>
            </div>
            <div style={{textAlign:'center', background:'rgba(255,255,255,0.2)', borderRadius:'12px', padding:'12px 20px'}}>
              <p style={{fontSize:'24px', fontWeight:'bold'}}>{myRecipes.length}</p>
              <p style={{fontSize:'12px', opacity:'0.85'}}>Uploaded</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{display:'flex', gap:'8px', marginBottom:'28px', flexWrap:'wrap'}}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{padding:'10px 20px', borderRadius:'10px', border:'none', fontWeight:'600', fontSize:'14px', cursor:'pointer', background: activeTab === tab.id ? '#f97316' : 'white', color: activeTab === tab.id ? 'white' : '#555', boxShadow:'0 2px 8px rgba(0,0,0,0.08)', transition:'all 0.2s'}}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'saved' && (
        <div>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
            <h2 style={{fontSize:'20px', fontWeight:'bold', color:'#1e293b'}}>Saved Recipes ({savedRecipes.length})</h2>
            <Link to="/home" style={{background:'#fff7ed', color:'#f97316', padding:'8px 16px', borderRadius:'10px', fontSize:'13px', fontWeight:'600', textDecoration:'none'}}>+ Save More Recipes</Link>
          </div>
          {loading ? (
            <div className="empty"><div className="emoji">⏳</div><p>Loading...</p></div>
          ) : savedRecipes.length === 0 ? (
            <div className="empty">
              <div className="emoji">❤️</div>
              <p>No saved recipes yet!</p>
              <Link to="/home" style={{display:'inline-block', marginTop:'16px', background:'#f97316', color:'white', padding:'10px 24px', borderRadius:'10px', textDecoration:'none', fontWeight:'600', fontSize:'14px'}}>Browse Recipes</Link>
            </div>
          ) : (
            <div className="grid">
              {savedRecipes.map(recipe => <SavedCard key={recipe.id} recipe={recipe} onUnsave={handleUnsave} />)}
            </div>
          )}
        </div>
      )}

      {activeTab === 'myrecipes' && (
        <div>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
            <h2 style={{fontSize:'20px', fontWeight:'bold', color:'#1e293b'}}>My Recipes ({myRecipes.length})</h2>
            <button onClick={() => setShowModal(true)} style={{background:'#f97316', color:'white', border:'none', padding:'10px 20px', borderRadius:'10px', fontSize:'14px', fontWeight:'600', cursor:'pointer'}}>+ Upload Recipe</button>
          </div>
          {loading ? (
            <div className="empty"><div className="emoji">⏳</div><p>Loading...</p></div>
          ) : myRecipes.length === 0 ? (
            <div className="empty">
              <div className="emoji">👨‍🍳</div>
              <p>You haven't uploaded any recipes yet!</p>
              <button onClick={() => setShowModal(true)} style={{display:'inline-block', marginTop:'16px', background:'#f97316', color:'white', padding:'10px 24px', borderRadius:'10px', border:'none', fontWeight:'600', fontSize:'14px', cursor:'pointer'}}>Upload Your First Recipe</button>
            </div>
          ) : (
            <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
              {myRecipes.map(recipe => <MyRecipeCard key={recipe.id} recipe={recipe} onDelete={handleDelete} onEdit={(r) => setEditingRecipe(r)} />)}
            </div>
          )}
        </div>
      )}

      {activeTab === 'profile' && (
        <div style={{maxWidth:'480px'}}>
          <h2 style={{fontSize:'20px', fontWeight:'bold', color:'#1e293b', marginBottom:'24px'}}>Profile Settings</h2>
          <div style={{background:'white', borderRadius:'20px', padding:'32px', boxShadow:'0 4px 20px rgba(0,0,0,0.08)'}}>
            <div style={{width:'72px', height:'72px', borderRadius:'50%', background:'linear-gradient(135deg, #f97316, #ef4444)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px', fontWeight:'bold', color:'white', marginBottom:'24px'}}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{marginBottom:'16px'}}>
              <label style={{fontSize:'13px', fontWeight:'600', color:'#374151', display:'block', marginBottom:'6px'}}>Full Name</label>
              <input className="input" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} placeholder="Your name" />
            </div>
            <div style={{marginBottom:'16px'}}>
              <label style={{fontSize:'13px', fontWeight:'600', color:'#374151', display:'block', marginBottom:'6px'}}>Email</label>
              <input className="input" value={user?.email} disabled style={{background:'#f8fafc', color:'#888'}} />
            </div>
            <div style={{marginBottom:'24px'}}>
              <label style={{fontSize:'13px', fontWeight:'600', color:'#374151', display:'block', marginBottom:'6px'}}>Bio (optional)</label>
              <textarea value={profileForm.bio} onChange={e => setProfileForm({...profileForm, bio: e.target.value})} placeholder="Tell us a bit about yourself..." rows={3} style={{width:'100%', border:'1px solid #e2e8f0', borderRadius:'12px', padding:'12px 16px', fontSize:'14px', outline:'none', resize:'vertical', fontFamily:'sans-serif', boxSizing:'border-box'}} />
            </div>
            {profileSaved && <p style={{color:'#16a34a', fontSize:'13px', marginBottom:'12px', fontWeight:'600'}}>✅ Profile updated successfully!</p>}
            <button className="btn" onClick={handleProfileSave}>Save Changes</button>
            <button onClick={logout} style={{width:'100%', marginTop:'12px', background:'#fef2f2', color:'#dc2626', border:'1px solid #fecaca', padding:'14px', borderRadius:'12px', fontSize:'15px', fontWeight:'600', cursor:'pointer'}}>Logout</button>
          </div>
        </div>
      )}

      {showModal && <RecipeModal onClose={() => setShowModal(false)} onSave={handleUpload} />}
      {editingRecipe && <RecipeModal recipe={{...editingRecipe, ingredients: editingRecipe.ingredients?.join(', '), steps: editingRecipe.steps?.join('\n')}} onClose={() => setEditingRecipe(null)} onSave={handleEdit} />}
    </div>
  )
}