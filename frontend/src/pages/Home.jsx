import { useState } from 'react'
import { searchRecipes } from '../utils/api'
import RecipeCard from '../components/RecipeCard'

export default function Home() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (q) => {
    const searchQuery = q || query
    if (!searchQuery.trim()) return
    setQuery(searchQuery)
    setLoading(true)
    setSearched(true)
    try {
      const data = await searchRecipes(searchQuery)
      setResults(data.results)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  return (
    <div>
      <div className="hero">
        <h1>Discover Your Next Favorite Recipe</h1>

        <div className="search-bar">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search recipes..."
          />
          <button onClick={() => handleSearch()}>Search</button>
        </div>
        <div className="tags">
          {['chicken', 'pasta', 'chocolate', 'vegetarian', 'quick'].map(tag => (
            <button key={tag} className="tag" onClick={() => handleSearch(tag)}>
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="container">
        {loading && (
          <div className="empty">
            <div className="emoji">🍳</div>
            <p>Finding recipes...</p>
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="empty">
            <div className="emoji">😕</div>
            <p>No recipes found. Try another search!</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <>
            <p className="result-header">Found {results.length} recipes for "{query}"</p>
            <div className="grid">
              {results.map(recipe => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          </>
        )}

        {!searched && (
          <div className="empty">
            <div className="emoji">🥗</div>
            <p>What are you craving today? Search above to get started!</p>
          </div>
        )}
      </div>
    </div>
  )
}