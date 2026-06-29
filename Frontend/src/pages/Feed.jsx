import React from 'react'
import { useState, useEffect } from 'react'
import ListingCard from '../components/ListingCard';

const Feed = () => {
    const [listings, setListings]=useState([]);
    const [loading, setLoading]=useState(true);
    const [error, setError]=useState('');

    useEffect(()=>{
        const fetchListings = async ()=>{
            try {
                const response = await fetch('http://localhost:3000/api/listings',{
                credentials:'include'
            })
            const data = await response.json()
            setListings(data.listings || [])
                
            } catch (error) {
                setError(error.message)
            }
            finally{
                setLoading(false)
            }
        }
        fetchListings()
    },[])

    if(loading) return <div className='flex items-center justify-center h-screen'>Loading</div>
    if(error) return <div className='flex items-center justify-center h-screen text-red-600'>{error}</div>
    if(!listings.length) return <div className='flex items-center justify-center h-screen'>No Listings</div>
  return (
    <div className='h-screen overflow-y-scroll snap-y snap-mandatory'>
        {listings.map((listing)=>(
            <ListingCard key={listing._id} listing={listing}/>
        ))}
    </div>
  )
}

export default Feed