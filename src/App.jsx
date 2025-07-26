import { useState } from 'react'
import Home from './pages/Home'
import {Routes, Route} from 'react-router-dom'
import Contributions from './pages/Contributions'
import Signin from './pages/Signin'
import Signup from './pages/Signup'
import './App.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)  

  return (
    <div class="bg-zinc-100 h-screen ">
        <Routes>
          {!isLoggedIn && (
            <>
              <Route element={<Signin />} path="/signin" />
              <Route element={<Signup />} path="/signup" />
            </>
          )}
          <Route element={<Home />} path="/" />
          <Route element={<Contributions />} path="/contributions" />
        </Routes>
    </div>
  );
}

export default App
