import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import Feed from './pages/Feed'
import CreateListing from './pages/CreateListing'


const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />}/>
        <Route path='/login' element={<Login />}/>
        <Route path='/feed' element={<Feed />}/>
        <Route path='/create-listing' element={<CreateListing />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App