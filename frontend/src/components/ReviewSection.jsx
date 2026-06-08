import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const BASE_URL = 'http://localhost:5000'

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div style={{display:'flex', gap:'4px', cursor:'pointer'}}>
      {[1,2,3,4,5].map(star => (
        <span
          key={star}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          style={{
            fontSize:'28px',
            color: star <= (hovered || value) ? '#f59e0b' : '#d1d5db',
            transition:'color 0.1s'
          }}
        >
          ★
        </span>
      ))}
    </div>
  )
}

function ReviewCard({ review }) {
  const stars = Math.round(review.rating)
  return (
    <div style={{
      background:'white', borderRadius:'14px', padding:'18px 20px',
      boxShadow:'0 2px 8px rgba(0,0,0,0.06)', marginBottom:'12px'
    }}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'8px'}}>
        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
          <div style={{
            width:'38px', height:'38px', borderRadius:'50%',
            background:'linear-gradient(135deg, #f97316, #ef4444)',
            display:'flex', alignItems:'center', justifyContent:'center',
            color:'white', fontWeight:'bold', fontSize:'15px'
          }}>
            {review.user_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p style={{fontWeight:'600', color:'#1e293b', fontSize:'14px'}}>{review.user_name}</p>
            <p style={{fontSize:'12px', color:'#aaa'}}>{review.date}</p>
          </div>
        </div>
        <div style={{color:'#f59e0b', fontSize:'16px'}}>
          {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
        </div>
      </div>
      {review.comment && (
        <p style={{color:'#555', fontSize:'14px', lineHeight:'1.6', marginTop:'8px'}}>
          {review.comment}
        </p>
      )}
    </div>
  )
}

export default function ReviewSection({ recipeId }) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState([])
  const [avgRating, setAvgRating] = useState(null)
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const fetchReviews = async () => {
    try {
      const res = await axios.get(BASE_URL + '/api/reviews/' + recipeId)
      setReviews(res.data.reviews)
      setAvgRating(res.data.avg_rating)

      // Check if current user already reviewed
      if (user) {
        const existing = res.data.reviews.find(r => r.user_email === user.email)
        if (existing) {
          setRating(existing.rating)
          setComment(existing.comment)
          setSubmitted(true)
        }
      }
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchReviews()
  }, [recipeId])

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a rating.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await axios.post(BASE_URL + '/api/reviews/' + recipeId, {
        user_name: user.name,
        user_email: user.email,
        rating: rating,
        comment: comment,
        date: new Date().toLocaleDateString('en-US', {
          year: 'numeric', month: 'short', day: 'numeric'
        })
      })
      setSubmitted(true)
      fetchReviews()
    } catch (err) {
      setError('Something went wrong. Please try again.')
    }
    setSubmitting(false)
  }

  return (
    <div style={{
      background:'white', borderRadius:'20px',
      boxShadow:'0 4px 20px rgba(0,0,0,0.08)',
      padding:'32px', marginBottom:'48px'
    }}>
      {/* Header */}
      <div style={{
        display:'flex', justifyContent:'space-between',
        alignItems:'center', marginBottom:'24px',
        flexWrap:'wrap', gap:'12px'
      }}>
        <div>
          <p style={{fontSize:'22px', fontWeight:'bold', color:'#1e293b', marginBottom:'4px'}}>
            Ratings & Reviews
          </p>
          {avgRating && (
            <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
              <span style={{fontSize:'32px', fontWeight:'bold', color:'#f59e0b'}}>{avgRating}</span>
              <div>
                <div style={{color:'#f59e0b', fontSize:'18px'}}>
                  {'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}
                </div>
                <p style={{fontSize:'12px', color:'#888'}}>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Write a review */}
      <div style={{
        background:'#f8fafc', borderRadius:'16px',
        padding:'24px', marginBottom:'28px'
      }}>
        <p style={{fontWeight:'bold', color:'#1e293b', marginBottom:'16px', fontSize:'15px'}}>
          {submitted ? '✏️ Update your review' : '✍️ Write a Review'}
        </p>

        <div style={{marginBottom:'16px'}}>
          <p style={{fontSize:'13px', color:'#888', marginBottom:'8px'}}>Your rating</p>
          <StarPicker value={rating} onChange={setRating} />
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this recipe... (optional)"
          rows={3}
          style={{
            width:'100%', border:'1px solid #e2e8f0', borderRadius:'12px',
            padding:'12px 16px', fontSize:'14px', outline:'none',
            resize:'vertical', fontFamily:'sans-serif', color:'#374151',
            boxSizing:'border-box'
          }}
        />

        {error && (
          <p style={{color:'#ef4444', fontSize:'13px', marginTop:'8px'}}>⚠️ {error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            marginTop:'14px', background:'#f97316', color:'white',
            border:'none', padding:'12px 28px', borderRadius:'10px',
            fontSize:'14px', fontWeight:'600', cursor:'pointer',
            opacity: submitting ? 0.7 : 1
          }}
        >
          {submitting ? 'Submitting...' : submitted ? 'Update Review' : 'Submit Review'}
        </button>
      </div>

      {/* Reviews list */}
      {loading && <p style={{color:'#888', textAlign:'center'}}>Loading reviews...</p>}

      {!loading && reviews.length === 0 && (
        <div style={{textAlign:'center', padding:'32px 0'}}>
          <p style={{fontSize:'40px', marginBottom:'12px'}}>💬</p>
          <p style={{color:'#888', fontSize:'15px'}}>No reviews yet. Be the first to review!</p>
        </div>
      )}

      {!loading && reviews.length > 0 && (
        <div>
          <p style={{fontWeight:'600', color:'#1e293b', marginBottom:'16px', fontSize:'15px'}}>
            All Reviews ({reviews.length})
          </p>
          {reviews.map((review, i) => (
            <ReviewCard key={i} review={review} />
          ))}
        </div>
      )}
    </div>
  )
}