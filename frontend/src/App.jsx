import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Home from './pages/Home'
import RecipePage from './pages/RecipePage'
import ExplorePage from './pages/ExplorePage'
import PersonalPage from './pages/PersonalPage'
import LoginPage from './pages/LoginPage'
import LandingPage from './pages/LandingPage'
import Navbar from './components/Navbar'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" />
  return children
}

function PublicRoute({ children }) {
  const { user } = useAuth()
  if (user) return <Navigate to="/home" />
  return children
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <div style={{minHeight:'100vh', background:'#f9f9f9'}}>
      {user && <Navbar />}
      <Routes>
        <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/recipe/:id" element={<ProtectedRoute><RecipePage /></ProtectedRoute>} />
        <Route path="/explore" element={<ProtectedRoute><ExplorePage /></ProtectedRoute>} />
        <Route path="/personal" element={<ProtectedRoute><PersonalPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App