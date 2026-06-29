import React, { useRef, useState, useEffect } from 'react'

const ListingCard = ({ listing }) => {
  const videoRef = useRef(null)
  const [muted, setMuted] = useState(true)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef.current.play()
          setMuted(false)
        } else {
          videoRef.current.pause()
          setMuted(true)
        }
      },
      { threshold: 0.8 } // 80% of video must be visible to count as "on screen"
    )

    if (videoRef.current) observer.observe(videoRef.current)

    return () => observer.disconnect()
  }, [])

  const toggleMute = () => {
    setMuted(prev => !prev)
  }

  return (
    <div className='h-screen w-full relative snap-start bg-black flex items-center justify-center'>
      <div className='relative h-full aspect-9/16 max-h-screen overflow-hidden'>
        <video
          ref={videoRef}
          src={listing.chapters?.[0]?.videoUrl}
          className='h-full w-full object-cover'
          autoPlay
          muted={muted}
          loop
          playsInline
          onClick={toggleMute}
        />
        <div className='absolute bottom-6 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded-full'>
          {muted ? '🔇 Tap for sound' : '🔊'}
        </div>
      </div>
    </div>
  )
}

export default ListingCard