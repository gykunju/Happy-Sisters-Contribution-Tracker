import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Home from './pages/Home'
import {Routes, Route} from 'react-router'
import Contributions from './pages/Contributions'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div class="bg-zinc-100 h-screen ">
      <Routes>
        <Route  element={<Home />} path="/" />
        <Route element={<Contributions />} path="/contributions" />
      </Routes>
    </div>
  );
}

export default App
