import axios from 'axios'

const BASE_URL = 'http://localhost:5000'
const UNSPLASH_KEY = '16kHENYV6kqWcd7b0tcpm5JC60UHJ1ExdsgwWKHgp8c'

export const searchRecipes = async (query) => {
  const res = await axios.get(BASE_URL + '/api/recipes/search?q=' + query)
  return res.data
}

export const getSimilarRecipes = async (recipeId) => {
  const res = await axios.get(BASE_URL + '/api/recommend/similar/' + recipeId)
  return res.data
}

export const getClusterRecipes = async (recipeId) => {
  const res = await axios.get(BASE_URL + '/api/recommend/cluster/' + recipeId)
  return res.data
}

export const getPersonalRecipes = async (userId) => {
  const res = await axios.get(BASE_URL + '/api/recommend/personal/' + userId)
  return res.data
}

export const getHybridRecipes = async (recipeId, userId = null) => {
  let url = BASE_URL + '/api/recommend/hybrid/' + recipeId
  if (userId) {
    url = url + '?user_id=' + userId
  }
  const res = await axios.get(url)
  return res.data
}

export const getFoodImage = async (recipeName) => {
  try {
    const query = recipeName.split(' ').slice(0, 3).join(' ')
    const res = await axios.get(
      'https://api.unsplash.com/search/photos?query=' + query + '+food&per_page=1&orientation=landscape',
      { headers: { Authorization: 'Client-ID ' + UNSPLASH_KEY } }
    )
    if (res.data.results.length > 0) {
      return res.data.results[0].urls.small
    }
    return null
  } catch (err) {
    return null
  }
}
export const getRecipeById = async (recipeId) => {
  const res = await axios.get(BASE_URL + '/api/recipes/' + recipeId)
  return res.data
}
// ── User Dashboard APIs ──
export const getSavedRecipes = async (email) => {
  const res = await axios.get(BASE_URL + '/api/user/saved?email=' + email)
  return res.data
}

export const saveRecipe = async (email, recipeId) => {
  const res = await axios.post(BASE_URL + '/api/user/saved', { email, recipe_id: recipeId })
  return res.data
}

export const unsaveRecipe = async (email, recipeId) => {
  const res = await axios.delete(BASE_URL + '/api/user/saved', { data: { email, recipe_id: recipeId } })
  return res.data
}

export const getMyRecipes = async (email) => {
  const res = await axios.get(BASE_URL + '/api/user/recipes?email=' + email)
  return res.data
}

export const uploadRecipe = async (email, recipe) => {
  const res = await axios.post(BASE_URL + '/api/user/recipes', { email, ...recipe })
  return res.data
}

export const deleteMyRecipe = async (email, recipeId) => {
  const res = await axios.delete(BASE_URL + '/api/user/recipes/' + recipeId + '?email=' + email)
  return res.data
}

export const editMyRecipe = async (email, recipeId, recipe) => {
  const res = await axios.put(BASE_URL + '/api/user/recipes/' + recipeId, { email, ...recipe })
  return res.data
}

export const updateProfile = async (email, data) => {
  const res = await axios.put(BASE_URL + '/api/user/profile', { email, ...data })
  return res.data
}