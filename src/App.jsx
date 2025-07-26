import { useState, useEffect } from 'react'
import Home from './pages/Home'
import {Routes, Route, useNavigate} from 'react-router-dom'
import Contributions from './pages/Contributions'
import Signin from './pages/Signin'
import Signup from './pages/Signup'
import supabase from './components/supabase'
import './App.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const navigate = useNavigate()

  // useEffect(()=>{
  //   async function Session(){
  //     const { data, error } = supabase.auth.getSession();
  //     console.log(data)
  //     console.log(error)
  //     if (data) {
  //       localStorage.setItem('user', data.name)  
  //       return true
  //     } else {
  //       setIsLoggedIn(false)
  //     }
  //   }
  //   if (!Session()){
  //     navigate('/login')
  //   }
  // })
  
  

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
