import { useState } from 'react'
import { getPersonalRecipes } from '../utils/api'
import RecipeCard from '../components/RecipeCard'

export default function PersonalPage() {
  const [userId, setUserId] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleGetRecommendations = async () => {
    if (!userId.trim()) return
    setLoading(true)
    setSearched(true)
    try {
      const data = await getPersonalRecipes(userId)
      setResults(Array.isArray(data.recommendations) ? data.recommendations : [])
    } catch (err) {
      console.error(err)
      setResults([])
    }
    setLoading(false)
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Personal Recommendations</h1>
  </div>

      <div className="personal-box">
        <h2>Enter your User ID</h2>
        <p className="hint">
          Try user ID: <span onClick={() => setUserId('56463')}>56463</span>
        </p>
        <input
          className="input"
          type="number"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Enter user ID..."
        />
        <button className="btn" onClick={handleGetRecommendations}>
          Get My Recommendations
        </button>
      </div>

      {loading && (
        <div className="empty">
          <div className="emoji">🤖</div>
          <p> Finding your perfect recipes...</p>
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="empty">
          <div className="emoji">😕</div>
          <p>No recommendations found for this user ID.</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <>
          <p className="result-header">Recommended just for you ✨</p>
          <div className="algo-badge"></div>
          <div className="grid">
            {results.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}