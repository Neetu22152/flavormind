import { useState, useEffect } from 'react'
import { searchRecipes, getFoodImage } from '../utils/api'
import RecipeCard from '../components/RecipeCard'

const FILTERS = [
  { label: 'All', max_minutes: null, max_ingredients: null },
  { label: '⚡ Under 30 mins', max_minutes: 30, max_ingredients: null },
  { label: '🕐 Under 1 hour', max_minutes: 60, max_ingredients: null },
  { label: '🥗 Few ingredients', max_minutes: null, max_ingredients: 7 },
]

const DIET_TAGS = ['vegetarian', 'vegan', 'low-calorie', 'gluten-free', 'low-fat']

const FEATURED = [
  { name: 'Pasta Carbonara', query: 'pasta carbonara' },
  { name: 'Grilled Chicken', query: 'grilled chicken' },
  { name: 'Chocolate Cake', query: 'chocolate cake' },
  { name: 'Caesar Salad', query: 'caesar salad' },
  { name: 'Beef Tacos', query: 'beef tacos' },
  { name: 'Mushroom Soup', query: 'mushroom soup' },
]

const TRENDING = [
  { label: '🍕 Italian', query: 'italian' },
  { label: '🌮 Mexican', query: 'mexican' },
  { label: '🍜 Asian', query: 'asian noodles' },
  { label: '🥗 Healthy', query: 'healthy salad' },
  { label: '🍰 Desserts', query: 'dessert cake' },
  { label: '🍳 Breakfast', query: 'breakfast eggs' },
  { label: '🐟 Seafood', query: 'seafood fish' },
  { label: '🥩 BBQ', query: 'bbq grilled' },
]

function FeaturedCard({ item, onClick }) {
  const [image, setImage] = useState(null)

  useEffect(() => {
    getFoodImage(item.query + ' food dish').then(url => setImage(url))
  }, [item.query])

  return (
    <div
      onClick={() => onClick(item.query)}
      style={{
        borderRadius:'16px', overflow:'hidden', cursor:'pointer',
        position:'relative', height:'180px', flexShrink:0, width:'200px',
        boxShadow:'0 4px 16px rgba(0,0,0,0.12)', transition:'transform 0.2s'
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      {image
        ? <img src={image} alt={item.name} style={{width:'100%', height:'100%', objectFit:'cover'}} />
        : <div style={{width:'100%', height:'100%', background:'#fff7ed', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'40px'}}>🍽️</div>
      }
      <div style={{
        position:'absolute', bottom:0, left:0, right:0,
        background:'linear-gradient(transparent, rgba(0,0,0,0.75))',
        padding:'20px 14px 14px'
      }}>
        <p style={{color:'white', fontWeight:'600', fontSize:'14px'}}>{item.name}</p>
      </div>
    </div>
  )
}

export default function Home() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [activeFilter, setActiveFilter] = useState(0)
  const [activeTag, setActiveTag] = useState(null)

  const handleSearch = async (q, filterIdx, tag) => {
    const searchQuery = q !== undefined ? q : query
    const filter = FILTERS[filterIdx !== undefined ? filterIdx : activeFilter]
    const dietTag = tag !== undefined ? tag : activeTag
    if (!searchQuery.trim() && !dietTag) return
    setLoading(true)
    setSearched(true)
    try {
      let url = 'http://localhost:5000/api/recipes/search?q=' + searchQuery
      if (filter.max_minutes) url += '&max_minutes=' + filter.max_minutes
      if (filter.max_ingredients) url += '&max_ingredients=' + filter.max_ingredients
      if (dietTag) url += '&tag=' + dietTag
      const res = await fetch(url)
      const data = await res.json()
      setResults(data.results || [])
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const handleFilterClick = (idx) => {
    setActiveFilter(idx)
    handleSearch(query, idx, activeTag)
  }

  const handleTagClick = (tag) => {
    const newTag = activeTag === tag ? null : tag
    setActiveTag(newTag)
    handleSearch(query, activeFilter, newTag)
  }

  return (
    <div>
      {/* Hero */}
      <div style={{
        background:'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
        padding:'60px 48px 48px', color:'white'
      }}>
        <div style={{maxWidth:'1100px', margin:'0 auto'}}>
          <h1 style={{fontSize:'44px', fontWeight:'bold', marginBottom:'12px', lineHeight:'1.2'}}>
            What are you craving today?
          </h1>
          <p style={{fontSize:'17px', opacity:'0.9', marginBottom:'32px'}}>
            Search from 229,000+ recipes and get personalized recommendations just for you
          </p>

          {/* Search bar */}
          <div style={{
            display:'flex', gap:'12px', maxWidth:'680px',
            background:'white', borderRadius:'16px', padding:'8px',
            boxShadow:'0 8px 32px rgba(0,0,0,0.15)'
          }}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by dish, ingredient or cuisine..."
              style={{
                flex:1, border:'none', outline:'none', fontSize:'16px',
                padding:'10px 16px', color:'#1e293b', background:'transparent'
              }}
            />
            <button
              onClick={() => handleSearch()}
              style={{
                background:'#f97316', color:'white', border:'none',
                padding:'12px 28px', borderRadius:'12px', fontSize:'15px',
                fontWeight:'bold', cursor:'pointer', whiteSpace:'nowrap'
              }}
            >
              Search
            </button>
          </div>

          {/* Quick tags */}
          <div style={{display:'flex', gap:'10px', marginTop:'20px', flexWrap:'wrap'}}>
            {['chicken', 'pasta', 'chocolate', 'vegetarian', 'quick', 'soup', 'salad'].map(tag => (
              <button
                key={tag}
                onClick={() => { setQuery(tag); handleSearch(tag) }}
                style={{
                  background:'rgba(255,255,255,0.2)', color:'white',
                  border:'1px solid rgba(255,255,255,0.4)',
                  padding:'7px 16px', borderRadius:'999px', fontSize:'13px',
                  fontWeight:'600', cursor:'pointer', textTransform:'capitalize',
                  transition:'all 0.2s'
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {!searched ? (
        <div style={{maxWidth:'1100px', margin:'0 auto', padding:'48px 32px'}}>

          {/* Featured dishes */}
          <div style={{marginBottom:'48px'}}>
            <h2 style={{fontSize:'22px', fontWeight:'bold', color:'#1e293b', marginBottom:'6px'}}>
              Featured Dishes
            </h2>
            <p style={{color:'#888', fontSize:'14px', marginBottom:'20px'}}>
              Click any dish to explore similar recipes
            </p>
            <div style={{
              display:'flex', gap:'16px', overflowX:'auto',
              paddingBottom:'8px',
            }}>
              {FEATURED.map(item => (
                <FeaturedCard
                  key={item.name}
                  item={item}
                  onClick={(q) => { setQuery(q); handleSearch(q) }}
                />
              ))}
            </div>
          </div>

          {/* Browse by cuisine */}
          <div style={{marginBottom:'48px'}}>
            <h2 style={{fontSize:'22px', fontWeight:'bold', color:'#1e293b', marginBottom:'6px'}}>
              Browse by Cuisine
            </h2>
            <p style={{color:'#888', fontSize:'14px', marginBottom:'20px'}}>
              Explore recipes from around the world
            </p>
            <div style={{display:'flex', gap:'10px', flexWrap:'wrap'}}>
              {TRENDING.map(t => (
                <button
                  key={t.label}
                  onClick={() => { setQuery(t.query); handleSearch(t.query) }}
                  style={{
                    background:'white', border:'1px solid #e2e8f0',
                    padding:'10px 20px', borderRadius:'999px', fontSize:'14px',
                    fontWeight:'600', cursor:'pointer', color:'#374151',
                    boxShadow:'0 2px 6px rgba(0,0,0,0.05)', transition:'all 0.2s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#f97316'
                    e.currentTarget.style.color = '#f97316'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#e2e8f0'
                    e.currentTarget.style.color = '#374151'
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Why FlavorMind */}
          <div style={{
            background:'linear-gradient(135deg, #fff7ed, #fef2f2)',
            borderRadius:'24px', padding:'40px', marginBottom:'48px'
          }}>
            <h2 style={{fontSize:'22px', fontWeight:'bold', color:'#1e293b', marginBottom:'24px'}}>
              Why people love FlavorMind
            </h2>
            <div style={{
              display:'grid',
              gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))',
              gap:'24px'
            }}>
              {[
                { icon:'🎯', title:'Personalized for you', desc:'Recommendations based on your taste and preferences' },
                { icon:'📊', title:'Nutrition info', desc:'Full nutrition breakdown for every recipe' },
                { icon:'⭐', title:'Community ratings', desc:'Real ratings from thousands of home cooks' },
                { icon:'⚡', title:'Fast results', desc:'Search 229,000+ recipes in seconds' },
              ].map(f => (
                <div key={f.title} style={{display:'flex', gap:'14px', alignItems:'flex-start'}}>
                  <div style={{
                    fontSize:'24px', background:'white', width:'48px', height:'48px',
                    borderRadius:'12px', display:'flex', alignItems:'center',
                    justifyContent:'center', flexShrink:0,
                    boxShadow:'0 2px 8px rgba(0,0,0,0.08)'
                  }}>
                    {f.icon}
                  </div>
                  <div>
                    <p style={{fontWeight:'bold', color:'#1e293b', fontSize:'14px', marginBottom:'4px'}}>{f.title}</p>
                    <p style={{color:'#888', fontSize:'13px', lineHeight:'1.5'}}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : (
        <div style={{maxWidth:'1100px', margin:'0 auto', padding:'32px'}}>

          {/* Filters */}
          <div style={{marginBottom:'24px'}}>
            <div style={{display:'flex', gap:'10px', flexWrap:'wrap', marginBottom:'12px'}}>
              {FILTERS.map((f, i) => (
                <button
                  key={f.label}
                  onClick={() => handleFilterClick(i)}
                  style={{
                    padding:'8px 16px', borderRadius:'999px', fontSize:'13px',
                    fontWeight:'600', cursor:'pointer', border:'2px solid',
                    borderColor: activeFilter === i ? '#f97316' : '#e2e8f0',
                    background: activeFilter === i ? '#fff7ed' : 'white',
                    color: activeFilter === i ? '#f97316' : '#555',
                    transition:'all 0.2s'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div style={{display:'flex', gap:'8px', flexWrap:'wrap'}}>
              {DIET_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  style={{
                    padding:'6px 14px', borderRadius:'999px', fontSize:'12px',
                    fontWeight:'600', cursor:'pointer', border:'2px solid',
                    borderColor: activeTag === tag ? '#16a34a' : '#e2e8f0',
                    background: activeTag === tag ? '#dcfce7' : 'white',
                    color: activeTag === tag ? '#16a34a' : '#555',
                    transition:'all 0.2s', textTransform:'capitalize'
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {loading && (
            <div className="empty">
              <div className="emoji">🍳</div>
              <p>Finding recipes...</p>
            </div>
          )}

          {!loading && results.length === 0 && (
            <div className="empty">
              <div className="emoji">😕</div>
              <p>No recipes found. Try another search!</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <>
              <div style={{
                display:'flex', justifyContent:'space-between',
                alignItems:'center', marginBottom:'24px'
              }}>
                <p style={{fontSize:'18px', fontWeight:'bold', color:'#1e293b'}}>
                  {results.length} recipes found
                  {query && <span style={{color:'#f97316'}}> for "{query}"</span>}
                </p>
                <button
                  onClick={() => { setSearched(false); setQuery(''); setResults([]) }}
                  style={{
                    background:'none', border:'1px solid #e2e8f0', color:'#888',
                    padding:'8px 16px', borderRadius:'10px', cursor:'pointer',
                    fontSize:'13px', fontWeight:'600'
                  }}
                >
                  ← Clear search
                </button>
              </div>
              <div className="grid">
                {results.map(recipe => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}