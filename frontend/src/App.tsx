import { Route, Routes } from 'react-router-dom'
import LoginPage from './pages/loginPage'
import RegisterPage from './pages/registerPage'
import ChatPage from './pages/chatPage'
import ProtectedRoute from './components/ProtectedRoute'

function App() {

  return (
    <Routes> 
      <Route path='/login' element={<LoginPage />} />
      <Route path='/register' element={<RegisterPage />} />
      <Route path='/chat' element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
      <Route path='*' element={<LoginPage />} />
    </Routes>
  )
}

export default App
