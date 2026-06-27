import React from 'react'
import { useState, useContext } from 'react'
import AuthContext from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const Login = () => {
    const navigate = useNavigate()
    const [email, setEmail]=useState('')
    const [password, setPassword]=useState('')
    const [error, setError]=useState('')
    const { login }=useContext(AuthContext)

    const handleLogin = async () => {
        const data = await login(email, password)
        if (!data.user) {
            setError(data.message || data.Message)
        } else {
            navigate('/')
        }
    }
  return (
    <div className="flex items-center justify-center min-h-screen bg-primary-300">
      <div className="bg-white p-8 rounded-lg w-96">
        <h1 className="text-4xl font-bold text-primary-900 mb-8">ReelEstate</h1>
        
        {error && <p className="text-red-600 mb-4">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border border-primary-200 rounded mb-4"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border border-primary-200 rounded mb-6"
        />

        <button
          onClick={handleLogin}
          className="w-full bg-primary-900 text-white p-3 rounded font-bold"
        >
          Login
        </button>
      </div>
    </div>
  )
}

export default Login