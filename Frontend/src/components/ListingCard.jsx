import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Volume2, VolumeX, ChevronRight } from "lucide-react";

const ListingCard = ({ listing }) => {
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const [muted, setMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef.current?.play();
          setIsPlaying(true);
        } else {
          videoRef.current?.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.8 },
    );

    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    setMuted((prev) => !prev);
  };

  return (
    <div className="h-screen md:h-screen w-full relative snap-start bg-black flex items-center justify-center md:pt-17">
      <div className="relative h-full aspect-9/16 overflow-hidden">
        <video
          ref={videoRef}
          src={listing.chapters?.[0]?.videoUrl}
          className="h-full w-full object-cover"
          muted={muted}
          loop
          playsInline
          onClick={togglePlayPause}
        />

        {/* View Details Button — Desktop Only */}
        <button
          onClick={() => navigate(`/listing/${listing._id}`)}
          className="hidden md:flex absolute top-6 right-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full z-20 items-center gap-2 transition-all"
        >
          <ChevronRight size={20} />
        </button>

        {/* Mute Button */}
        <button
          onClick={toggleMute}
          className="absolute bottom-20 md:bottom-6 right-4 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full z-20"
        >
          {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>

        {/* Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 pb-20 md:pb-6 text-white">
          <h2 className="text-2xl font-bold mb-2">{listing.title}</h2>
          <p className="text-sm text-white/80">
            {listing.bedrooms} BHK • {listing.size} sqft • {listing.city}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;