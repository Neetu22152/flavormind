import { useState, useEffect } from 'react'
import { searchRecipes, getClusterRecipes, getFoodImage } from '../utils/api'
import RecipeCard from '../components/RecipeCard'

const CATEGORIES = [
  { name: 'Chicken & Poultry', search: 'chicken' },
  { name: 'Beef & Meat', search: 'beef steak' },
  { name: 'Pasta & Noodles', search: 'pasta' },
  { name: 'Seafood & Fish', search: 'fish seafood' },
  { name: 'Vegetarian', search: 'vegetable' },
  { name: 'Soups & Stews', search: 'soup' },
  { name: 'Chocolate Desserts', search: 'chocolate' },
  { name: 'Cakes & Baking', search: 'cake' },
  { name: 'Breakfast', search: 'egg breakfast' },
  { name: 'Pies & Tarts', search: 'pie' },
  { name: 'Mexican Food', search: 'mexican' },
  { name: 'Italian Food', search: 'italian' },
  { name: 'Quick Meals', search: 'easy quick' },
  { name: 'Pork', search: 'pork' },
  { name: 'Salads', search: 'salad' },
  { name: 'Breads', search: 'bread' },
]

function CategoryCard({ cat, onClick }) {
  const [image, setImage] = useState(null)

  useEffect(() => {
    getFoodImage(cat.search + ' food dish').then(url => setImage(url))
  }, [cat.search])

  return (
    <div className="category-card" onClick={() => onClick(cat)}>
      <div className="category-image">
        {image
          ? <img src={image} alt={cat.name} className="category-img" />
          : <div className="category-img-placeholder">🍽️</div>
        }
      </div>
      <p>{cat.name}</p>
    </div>
  )
}

export default function ExplorePage() {
  const [query, setQuery] = useState('')
  const [clusterResults, setClusterResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeCategory, setActiveCategory] = useState(null)
  const [error, setError] = useState(null)

  const loadCategory = async (searchQuery, categoryName) => {
    setLoading(true)
    setError(null)
    setClusterResults(null)
    try {
      const data = await searchRecipes(searchQuery)
      if (data.results && data.results.length > 0) {
        const clusterData = await getClusterRecipes(data.results[0].id)
        setClusterResults(clusterData)
      } else {
        // Try with shorter query
        const shortQuery = searchQuery.split(' ')[0]
        const data2 = await searchRecipes(shortQuery)
        if (data2.results && data2.results.length > 0) {
          const clusterData = await getClusterRecipes(data2.results[0].id)
          setClusterResults(clusterData)
        } else {
          setError('No recipes found for ' + categoryName + '. Try searching manually.')
        }
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
      console.error(err)
    }
    setLoading(false)
  }

  const handleCategoryClick = async (cat) => {
    setActiveCategory(cat.name)
    await loadCategory(cat.search, cat.name)
  }

  const handleSearch = async () => {
    if (!query.trim()) return
    setActiveCategory(query)
    await loadCategory(query, query)
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Explore by Category</h1>
     </div>

      <div className="search-row">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Or search a specific dish..."
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {/* Category Grid */}
      {!clusterResults && !loading && !error && (
        <>
          <p className="select-prompt">Browse by cuisine or dish type:</p>
          <div className="category-grid">
            {CATEGORIES.map(cat => (
              <CategoryCard key={cat.name} cat={cat} onClick={handleCategoryClick} />
            ))}
          </div>
        </>
      )}

      {loading && (
        <div className="empty">
          <div className="emoji">🔍</div>
          <p>Loading {activeCategory} recipes...</p>
        </div>
      )}

      {error && !loading && (
        <div className="empty">
          <div className="emoji">😕</div>
          <p>{error}</p>
          <button className="btn" style={{marginTop: '20px', width: 'auto', padding: '12px 24px'}}
            onClick={() => { setError(null); setActiveCategory(null) }}>
            Back to categories
          </button>
        </div>
      )}

      {!loading && !error && clusterResults && (
        <>
          <div className="cluster-banner">
            📂 <strong>{activeCategory}</strong>
            <span style={{fontSize: '13px', marginLeft: '8px', opacity: 0.7}}>
              — {clusterResults.recommendations?.length} recipes found
            </span>
          </div>
          <button className="back-btn" onClick={() => {
            setClusterResults(null)
            setActiveCategory(null)
            setQuery('')
            setError(null)
          }}>
            ← Back to categories
          </button>
          <div className="grid">
            {clusterResults.recommendations.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}