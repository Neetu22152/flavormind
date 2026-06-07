import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import RecipePage from './pages/RecipePage'
import ExplorePage from './pages/ExplorePage'
import PersonalPage from './pages/PersonalPage'
import Navbar from './components/Navbar'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recipe/:id" element={<RecipePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/personal" element={<PersonalPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App