import { useNavigate } from 'react-router-dom'

const FEATURES = [
  {
    icon: '🎯',
    title: 'Personalized Recommendations',
    desc: 'Get recipe suggestions tailored to your taste based on what you enjoy and what others with similar preferences love.'
  },
  {
    icon: '🍽️',
    title: 'Similar Recipe Discovery',
    desc: 'Found a recipe you love? Discover dozens of similar ones instantly — same ingredients, same vibe, new flavors.'
  },
  {
    icon: '📂',
    title: 'Browse by Category',
    desc: 'Explore recipes by cuisine type — Italian, Mexican, Seafood, Desserts and more. Find exactly what you are craving.'
  },
  {
    icon: '📊',
    title: 'Nutrition at a Glance',
    desc: 'Every recipe comes with a full nutrition breakdown — calories, protein, carbs, fat and more — so you can make informed choices.'
  },
  {
    icon: '⭐',
    title: 'Community Ratings',
    desc: 'See what thousands of home cooks think before you start. Every recipe shows real ratings from real people.'
  },
  {
    icon: '⚡',
    title: 'Fast & Simple',
    desc: 'Search by dish name, ingredient, or cuisine. Get results in seconds with beautiful food photography for every recipe.'
  },
]

const STEPS = [
  {
    step: '01',
    title: 'Create your account',
    desc: 'Sign up in seconds. No credit card required.'
  },
  {
    step: '02',
    title: 'Search or browse',
    desc: 'Search by dish, ingredient, or explore by cuisine category.'
  },
  {
    step: '03',
    title: 'Discover & cook',
    desc: 'Get personalized recommendations, check nutrition, and start cooking.'
  },
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div style={{fontFamily:'sans-serif', color:'#1e293b'}}>

      {/* Navbar */}
      <nav style={{
        background:'white', padding:'18px 48px',
        display:'flex', justifyContent:'space-between', alignItems:'center',
        boxShadow:'0 1px 4px rgba(0,0,0,0.08)', position:'sticky', top:0, zIndex:100
      }}>
        <span style={{fontSize:'22px', fontWeight:'bold', color:'#f97316'}}>
          🍽️ FlavorMind
        </span>
        <div style={{display:'flex', gap:'12px'}}>
          <button
            onClick={() => navigate('/login')}
            style={{
              background:'none', border:'2px solid #f97316', color:'#f97316',
              padding:'8px 22px', borderRadius:'10px', fontWeight:'600',
              fontSize:'14px', cursor:'pointer', transition:'all 0.2s'
            }}
          >
            Login
          </button>
          <button
            onClick={() => navigate('/login')}
            style={{
              background:'#f97316', border:'none', color:'white',
              padding:'8px 22px', borderRadius:'10px', fontWeight:'600',
              fontSize:'14px', cursor:'pointer', transition:'all 0.2s'
            }}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        background:'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
        padding:'110px 48px 90px', textAlign:'center', color:'white'
      }}>
        <h1 style={{
          fontSize:'54px', fontWeight:'bold', lineHeight:'1.2',
          maxWidth:'720px', margin:'0 auto 20px'
        }}>
          Find Recipes You'll Actually Want to Cook
        </h1>
        <p style={{
          fontSize:'19px', opacity:'0.92', maxWidth:'560px',
          margin:'0 auto 44px', lineHeight:'1.7'
        }}>
          Browse over 229,000 recipes, get personalized suggestions, and discover new favorites — all in one place.
        </p>
        <div style={{display:'flex', gap:'14px', justifyContent:'center', flexWrap:'wrap'}}>
          <button
            onClick={() => navigate('/login')}
            style={{
              background:'white', color:'#f97316', border:'none',
              padding:'16px 40px', borderRadius:'12px', fontSize:'16px',
              fontWeight:'bold', cursor:'pointer',
              boxShadow:'0 8px 24px rgba(0,0,0,0.12)'
            }}
          >
            Get Started — It's Free
          </button>
          <button
            onClick={() => navigate('/login')}
            style={{
              background:'rgba(255,255,255,0.15)', color:'white',
              border:'2px solid rgba(255,255,255,0.4)',
              padding:'16px 40px', borderRadius:'12px', fontSize:'16px',
              fontWeight:'bold', cursor:'pointer'
            }}
          >
            Login
          </button>
        </div>

        {/* Stats */}
        <div style={{
          display:'flex', gap:'56px', justifyContent:'center',
          marginTop:'72px', flexWrap:'wrap'
        }}>
          {[
            { number: '229,000+', label: 'Recipes' },
            { number: '15+', label: 'Cuisine Categories' },
            { number: '1M+', label: 'Community Ratings' },
            { number: '100%', label: 'Free to Use' },
          ].map(s => (
            <div key={s.label} style={{textAlign:'center'}}>
              <p style={{fontSize:'32px', fontWeight:'bold', marginBottom:'4px'}}>{s.number}</p>
              <p style={{opacity:'0.8', fontSize:'14px'}}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div style={{padding:'88px 48px', background:'#f8fafc'}}>
        <div style={{textAlign:'center', marginBottom:'56px'}}>
          <h2 style={{fontSize:'36px', fontWeight:'bold', marginBottom:'14px'}}>
            Everything You Need to Cook Better
          </h2>
          <p style={{color:'#64748b', fontSize:'17px', maxWidth:'480px', margin:'0 auto', lineHeight:'1.7'}}>
            FlavorMind makes it easy to find, save, and cook recipes you'll love every day.
          </p>
        </div>
        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))',
          gap:'24px', maxWidth:'1100px', margin:'0 auto'
        }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{
              background:'white', borderRadius:'20px', padding:'32px',
              boxShadow:'0 2px 12px rgba(0,0,0,0.06)',
              borderTop:'4px solid #f97316'
            }}>
              <div style={{fontSize:'36px', marginBottom:'16px'}}>{f.icon}</div>
              <h3 style={{
                fontSize:'17px', fontWeight:'bold',
                marginBottom:'10px', color:'#1e293b'
              }}>
                {f.title}
              </h3>
              <p style={{color:'#64748b', lineHeight:'1.7', fontSize:'14px'}}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={{padding:'88px 48px', background:'white'}}>
        <div style={{textAlign:'center', marginBottom:'56px'}}>
          <h2 style={{fontSize:'36px', fontWeight:'bold', marginBottom:'14px'}}>
            Getting Started is Simple
          </h2>
          <p style={{color:'#64748b', fontSize:'17px'}}>
            From sign up to your first recipe in under a minute
          </p>
        </div>
        <div style={{
          display:'flex', gap:'24px', justifyContent:'center',
          maxWidth:'860px', margin:'0 auto', flexWrap:'wrap'
        }}>
          {STEPS.map((s) => (
            <div key={s.step} style={{
              flex:1, minWidth:'220px', textAlign:'center', padding:'32px 20px',
              background:'#f8fafc', borderRadius:'20px'
            }}>
              <div style={{
                width:'56px', height:'56px', borderRadius:'50%',
                background:'linear-gradient(135deg, #f97316, #ef4444)',
                display:'flex', alignItems:'center', justifyContent:'center',
                margin:'0 auto 20px', fontSize:'18px', fontWeight:'bold', color:'white'
              }}>
                {s.step}
              </div>
              <h3 style={{
                fontSize:'17px', fontWeight:'bold',
                color:'#1e293b', marginBottom:'10px'
              }}>
                {s.title}
              </h3>
              <p style={{color:'#64748b', fontSize:'14px', lineHeight:'1.7'}}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonial / Trust strip */}
      <div style={{
        background:'#fff7ed', padding:'56px 48px', textAlign:'center',
        borderTop:'1px solid #fed7aa', borderBottom:'1px solid #fed7aa'
      }}>
        <p style={{
          fontSize:'24px', fontWeight:'600', color:'#1e293b',
          maxWidth:'640px', margin:'0 auto', lineHeight:'1.7',
          fontStyle:'italic'
        }}>
          "FlavorMind helped me discover recipes I never would have found on my own. The recommendations are surprisingly good."
        </p>
        <p style={{color:'#f97316', fontWeight:'600', marginTop:'20px', fontSize:'15px'}}>
          — Home cook, Kathmandu
        </p>
      </div>

      {/* CTA */}
      <div style={{
        background:'linear-gradient(135deg, #f97316, #ef4444)',
        padding:'88px 48px', textAlign:'center', color:'white'
      }}>
        <h2 style={{fontSize:'40px', fontWeight:'bold', marginBottom:'16px'}}>
          Ready to Find Your Next Favorite Recipe?
        </h2>
        <p style={{
          fontSize:'18px', opacity:'0.92', marginBottom:'40px', lineHeight:'1.7'
        }}>
          Join thousands of home cooks discovering new meals every day.
        </p>
        <button
          onClick={() => navigate('/login')}
          style={{
            background:'white', color:'#f97316', border:'none',
            padding:'18px 52px', borderRadius:'14px', fontSize:'17px',
            fontWeight:'bold', cursor:'pointer',
            boxShadow:'0 8px 24px rgba(0,0,0,0.15)'
          }}
        >
          Create Your Free Account
        </button>
      </div>

      {/* Footer */}
      <div style={{
        background:'#1e293b', padding:'32px 48px',
        display:'flex', justifyContent:'space-between', alignItems:'center',
        flexWrap:'wrap', gap:'16px'
      }}>
        <span style={{color:'#f97316', fontWeight:'bold', fontSize:'16px'}}>
          🍽️ FlavorMind
        </span>
        <p style={{color:'#64748b', fontSize:'13px'}}>
          © 2026 FlavorMind. All rights reserved.
        </p>
        <div style={{display:'flex', gap:'20px'}}>
          <span style={{color:'#64748b', fontSize:'13px', cursor:'pointer'}}>Privacy</span>
          <span style={{color:'#64748b', fontSize:'13px', cursor:'pointer'}}>Terms</span>
          <span style={{color:'#64748b', fontSize:'13px', cursor:'pointer'}}>Contact</span>
        </div>
      </div>

    </div>
  )
}