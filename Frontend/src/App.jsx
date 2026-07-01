import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import Feed from './pages/Feed'
import CreateListing from './pages/CreateListing'
import Register from './pages/Register'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import ListingDetail from './pages/ListingDetail'
import Search from './pages/Search'


const App = () => {
  return (   
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />}/>
        <Route path='/login' element={<Login />}/>
        <Route path='/feed' element={<Feed />}/>
        <Route path='/create-listing' element={<ProtectedRoute>
          <CreateListing />
        </ProtectedRoute>}/>
        <Route path='/register-user' element={<Register />}/>
        <Route path="/listing/:id" element={<ListingDetail />} />
        <Route path='/search' element={<Search />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App