import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getSimilarRecipes, getHybridRecipes, getFoodImage, getRecipeById } from '../utils/api'
import RecipeCard from '../components/RecipeCard'
import ReviewSection from '../components/ReviewSection'

export default function RecipePage() {
  const { id } = useParams()
  const [recipe, setRecipe] = useState(null)
  const [similar, setSimilar] = useState([])
  const [hybrid, setHybrid] = useState([])
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
  setLoading(true)
  try {
    // Always get recipe details first
    const recipeData = await getRecipeById(parseInt(id))
    setRecipe(recipeData)

    const img = await getFoodImage(recipeData.name + ' food dish')
    setImage(img)

    // Try similar recipes — might fail if not in model
    try {
      const similarData = await getSimilarRecipes(parseInt(id))
      setSimilar(similarData.recommendations || [])
    } catch (err) {
      console.log('Similar recipes not available for this recipe')
    }

    // Try hybrid recommendations — might fail if not in model
    try {
      const hybridData = await getHybridRecipes(parseInt(id))
      setHybrid(hybridData.hybrid_recommendations || [])
    } catch (err) {
      console.log('Hybrid recommendations not available for this recipe')
    }

  } catch (err) {
    console.error(err)
  }
  setLoading(false)
}
    fetchData()
  }, [id])

  if (loading) return (
    <div className="empty" style={{paddingTop: '120px'}}>
      <div className="emoji">🍳</div>
      <p>Loading recipe...</p>
    </div>
  )

  if (!recipe) return (
    <div className="empty" style={{paddingTop: '120px'}}>
      <div className="emoji">😕</div>
      <p>Recipe not found.</p>
      <Link to="/" className="btn" style={{display:'inline-block', marginTop:'20px', width:'auto', padding:'12px 24px'}}>
        ← Back to Home
      </Link>
    </div>
  )

  return (
    <div className="container">
      <Link to="/" className="back-btn" style={{display:'inline-block', marginBottom:'24px'}}>
        ← Back to search
      </Link>

      {/* Recipe Hero */}
      <div className="recipe-hero">
        {image
          ? <img src={image} alt={recipe.name} style={{width:'100%', height:'300px', objectFit:'cover'}} />
          : <div style={{height:'300px', background:'#fff7ed', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'80px'}}>🍽️</div>
        }
        <div className="recipe-hero-body">
          <h1 style={{textTransform:'capitalize'}}>{recipe.name}</h1>

          {/* Quick stats */}
          <div style={{display:'flex', gap:'24px', margin:'16px 0', flexWrap:'wrap'}}>
            <div style={{textAlign:'center'}}>
              <p style={{fontSize:'22px', fontWeight:'bold', color:'#f97316'}}>{recipe.minutes}</p>
              <p style={{fontSize:'12px', color:'#888'}}>minutes</p>
            </div>
            <div style={{textAlign:'center'}}>
              <p style={{fontSize:'22px', fontWeight:'bold', color:'#f97316'}}>{recipe.n_steps}</p>
              <p style={{fontSize:'12px', color:'#888'}}>steps</p>
            </div>
            <div style={{textAlign:'center'}}>
              <p style={{fontSize:'22px', fontWeight:'bold', color:'#f97316'}}>{recipe.ingredients?.length}</p>
              <p style={{fontSize:'12px', color:'#888'}}>ingredients</p>
            </div>
          </div>

          {/* Description */}
          {recipe.description && (
            <p style={{color:'#555', lineHeight:'1.6', marginBottom:'16px'}}>
              {recipe.description}
            </p>
          )}

          {/* Ingredients */}
          <div style={{marginBottom:'16px'}}>
            <p style={{fontWeight:'bold', color:'#1e293b', marginBottom:'10px'}}>🥘 Ingredients:</p>
            <div style={{display:'flex', flexWrap:'wrap', gap:'8px'}}>
              {recipe.ingredients?.map((ing, i) => (
                <span key={i} style={{
                  background:'#fff7ed', color:'#f97316',
                  padding:'4px 12px', borderRadius:'999px',
                  fontSize:'13px', fontWeight:'500'
                }}>
                  {ing}
                </span>
              ))}
            </div>
          </div>
          {/* Steps */}
{recipe.steps && recipe.steps.length > 0 && (
  <div style={{marginBottom:'16px'}}>
    <p style={{fontWeight:'bold', color:'#1e293b', marginBottom:'12px'}}>👨‍🍳 Instructions:</p>
    <ol style={{paddingLeft:'20px'}}>
      {recipe.steps.map((step, i) => (
        <li key={i} style={{
          marginBottom:'12px', color:'#555',
          lineHeight:'1.7', fontSize:'14px'
        }}>
          {step}
        </li>
      ))}
    </ol>
  </div>
)}

          {/* Algorithm badges */}
          <div style={{display:'flex', gap:'10px', marginTop:'16px', flexWrap:'wrap'}}>
            
          </div>
        </div>
      </div>

      {/* Similar Recipes */}
      {similar.length > 0 && (
        <div style={{marginBottom:'48px'}}>
          <p className="section-title">Similar Recipes</p>
            <div className="grid">
            {similar.slice(0, 8).map(r => (
              <RecipeCard key={r.id} recipe={r} />
            ))}
          </div>
        </div>
      )}

      {/* Hybrid Recommendations */}
      {hybrid.length > 0 && (
        <div style={{marginBottom:'48px'}}>
          <p className="section-title">You Might Also Love</p>
          
          <div className="grid">
            {hybrid.map(r => (
              <RecipeCard key={r.id} recipe={r} />
            ))}
          </div>
        </div>
      )}
      {/* Reviews */}
          <ReviewSection recipeId={parseInt(id)} />
    </div>
  )
}