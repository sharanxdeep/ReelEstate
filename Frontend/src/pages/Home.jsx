import React from 'react'

const Home = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-primary-300">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary-900 mb-8">ReelEstate</h1>
        <p className="text-lg text-primary-700 mb-8">Buy and sell properties with videos</p>
        <a href="/login" className="bg-primary-900 text-white px-8 py-3 rounded font-bold inline-block">
          Login
        </a>
      </div>
    </div>
  )
}

export default Home