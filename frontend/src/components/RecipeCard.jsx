import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getFoodImage } from '../utils/api'

export default function RecipeCard({ recipe }) {
  const [image, setImage] = useState(null)
  const [imgLoading, setImgLoading] = useState(true)

  useEffect(() => {
    getFoodImage(recipe.name).then(url => {
      setImage(url)
      setImgLoading(false)
    })
  }, [recipe.name])

  return (
    <Link to={"/recipe/" + recipe.id} className="card">
      <div className="card-image">
        {imgLoading && <div className="card-image-placeholder">🍽️</div>}
        {!imgLoading && image && (
          <img src={image} alt={recipe.name} className="card-img" />
        )}
        {!imgLoading && !image && (
          <div className="card-image-placeholder">🍽️</div>
        )}
      </div>
      <div className="card-body">
        <h3>{recipe.name}</h3>
        <div className="card-meta">
          <span>⏱️ {recipe.minutes} mins</span>
          <span>🥘 {recipe.ingredients?.length || '?'} ingredients</span>
        </div>
        {recipe.similarity_score && (
          <div className="badge">{Math.round(recipe.similarity_score * 100)}% match</div>
        )}
        {recipe.predicted_rating && (
          <div className="badge">⭐ {recipe.predicted_rating}/5</div>
        )}
        {recipe.hybrid_score && (
          <div className="badge">🤖 Score: {recipe.hybrid_score}</div>
        )}
      </div>
    </Link>
  )
}