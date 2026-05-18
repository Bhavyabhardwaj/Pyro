import { Route, Routes } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ChatPage from './pages/ChatPage'
import ProtectedRoute from './components/ProtectedRoute'

function App() {

  return (
    <Routes> 
      <Route path='/' element={<LandingPage />} />
      <Route path='/login' element={<LoginPage />} />
      <Route path='/register' element={<RegisterPage />} />
      <Route path='/chat' element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
      <Route path='*' element={<LandingPage />} />
    </Routes>
  )
}

export default App
