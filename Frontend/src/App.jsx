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
import Profile from './pages/Profile'
import EditProfile from './pages/EditProfile'
import EditListing from './pages/EditListing'
import Chat from './pages/Chat'


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
        <Route path='/profile' element={<ProtectedRoute>
          <Profile />
        </ProtectedRoute>}/>
        <Route path='/edit-profile' element={<ProtectedRoute>
          <EditProfile />
        </ProtectedRoute>}/>
        <Route path='/edit-listing/:id' element={<ProtectedRoute>
          <EditListing />
        </ProtectedRoute>}/>
        <Route path='/chat' element={<ProtectedRoute>
          <Chat />
        </ProtectedRoute>}/>

      </Routes>
    </BrowserRouter>
  )
}

export default App