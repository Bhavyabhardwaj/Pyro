import { Route, Routes } from 'react-router-dom'
import './App.css'
import LoginPage from './pages/loginPage'
import ChatPage from './pages/chatPage'
import RegisterPage from './pages/registerPage'

function App() {

  return (
    <Routes> 
      <Route path='/login' element={<LoginPage />} />
      <Route path='/register' element={<RegisterPage />} />
      <Route path='/chat' element={<ChatPage />} />
      <Route path='*' element={<LoginPage />} />
    </Routes>
  )
}

export default App
