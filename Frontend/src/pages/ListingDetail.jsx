import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MessageCircle, Calendar, Send } from "lucide-react";

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedChapter, setSelectedChapter] = useState(0);

  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [showPauseMsg, setShowPauseMsg] = useState(false);
  const pauseMsgTimeoutRef = useRef(null);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/listings/${id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) {
          console.error("Error:", data.message);
          return;
        }
        setListing(data.listing);
        if (data.listing.seller) {
          await fetchSeller(data.listing.seller);
        }
      } catch (error) {
        console.error("Error fetching listing:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  const fetchSeller = async (sellerId) => {
    try {
      const res = await fetch(`http://localhost:3000/api/auth/${sellerId}`, {
        credentials: "include",
      });
      const data = await res.json();
      setSeller(data.user);
    } catch (error) {
      console.error("Error fetching seller:", error);
    }
  };

  // Reset play state whenever the chapter changes
  useEffect(() => {
    setIsPlaying(true);
    setCurrentTime(0);
  }, [selectedChapter]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleVideoTap = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);

      // Show "Tap to pause" message for 2 seconds
      setShowPauseMsg(true);
      if (pauseMsgTimeoutRef.current) {
        clearTimeout(pauseMsgTimeoutRef.current);
      }
      pauseMsgTimeoutRef.current = setTimeout(() => {
        setShowPauseMsg(false);
      }, 2000);
    }
  };

  useEffect(() => {
    return () => {
      if (pauseMsgTimeoutRef.current) {
        clearTimeout(pauseMsgTimeoutRef.current);
      }
    };
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  if (!listing)
    return (
      <div className="flex items-center justify-center h-screen">
        Listing not found
      </div>
    );

  return (
    <div className="min-h-screen bg-black pt-20 pb-28 md:pb-12">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        {/* Hero block: blurred background image behind video + seller, contained to this section only */}
        <div className="relative rounded-2xl overflow-hidden mb-6 shadow-lg">
          <div
            className="absolute inset-0 bg-cover bg-center blur-md scale-110"
            style={{ backgroundImage: "url('/feed-background.jpg')" }}
          />
          <div className="absolute inset-0 bg-black/35" />

          <div className="relative p-4 md:p-6">
            {/* Seller Card */}
            {seller && (
              <div className="flex items-center gap-4 mb-4 p-3 bg-white/90 backdrop-blur-sm rounded-xl shadow-sm">
                <img
                  src={seller.avatar || "https://via.placeholder.com/60"}
                  alt={seller.name}
                  className="w-14 h-14 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-base text-primary-900">
                    {seller.name}
                  </h3>
                  <p className="text-xs text-gray-600">
                    Avg. Response Time: 2 hours
                  </p>
                </div>
              </div>
            )}

            {/* Video Player */}
            <div className="relative mx-auto max-w-sm">
              <video
                ref={videoRef}
                src={listing.chapters?.[selectedChapter]?.videoUrl}
                autoPlay
                playsInline
                controls={false}
                controlsList="nodownload noplaybackrate"
                disablePictureInPicture
                onTimeUpdate={handleTimeUpdate}
                onClick={handleVideoTap}
                className="w-full bg-black rounded-xl aspect-9/16 cursor-pointer object-cover"
              />

              {/* Tap to pause/play message */}
              {showPauseMsg && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-white text-sm font-medium tracking-wide bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full font-sans">
                    Tap to {isPlaying ? "pause" : "play"}
                  </span>
                </div>
              )}

              {/* Instagram-story style reply bar, centered, slightly above bottom */}
              <div className="absolute bottom-5 left-0 right-0 flex justify-center px-5 pointer-events-none">
                <div className="flex items-center w-full max-w-[220px] bg-white/30 hover:bg-white/40 backdrop-blur-[2px] border border-white/60 shadow-md rounded-full px-3 py-2 pointer-events-auto transition-colors">
                  <input
                    type="text"
                    placeholder={`Ask at ${formatTime(currentTime)}`}
                    className="flex-1 bg-transparent outline-none text-white placeholder-white text-xs font-semibold tracking-wide font-sans text-center drop-shadow-sm"
                  />
                  <button className="ml-1.5 text-white hover:text-white/80 transition-colors shrink-0">
                    <Send size={15} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chapters Grid */}
        {listing.chapters && listing.chapters.length > 0 && (
          <div className="mb-6 bg-white rounded-2xl shadow-sm p-4 md:p-6">
            <h3 className="text-lg font-bold text-primary-900 mb-4">
              Property Tour
            </h3>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {listing.chapters.map((ch, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedChapter(idx)}
                  className={`relative aspect-9/16 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 cursor-pointer ${
                    selectedChapter === idx
                      ? "border-primary-900"
                      : "border-gray-200"
                  }`}
                >
                  <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                    <video
                      src={ch.videoUrl}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded truncate">
                    {ch.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Property Info */}
        <div className="mb-6 bg-white rounded-2xl shadow-sm p-4 md:p-6">
          <h1 className="text-3xl font-bold mb-1 text-primary-900">
            {listing.title}
          </h1>
          <p className="text-2xl font-bold text-primary-800 mb-6">
            ₹{listing.price?.toLocaleString()}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6 pb-6 border-b border-gray-100">
            <div>
              <p className="text-sm text-gray-500">Bedrooms</p>
              <p className="text-2xl font-bold text-primary-900">{listing.bedrooms}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Bathrooms</p>
              <p className="text-2xl font-bold text-primary-900">{listing.bathrooms}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Size</p>
              <p className="text-2xl font-bold text-primary-900">{listing.size} sqft</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Type</p>
              <p className="text-2xl font-bold text-primary-900 capitalize">
                {listing.propertyType}
              </p>
            </div>
          </div>

          <div className={listing.amenities?.length ? "mb-6 pb-6 border-b border-gray-100" : "mb-0"}>
            <h2 className="text-lg font-bold mb-2 text-primary-900">
              Location
            </h2>
            <p className="text-gray-700">
              {listing.houseNumber} {listing.street}, {listing.locality}
            </p>
            <p className="text-gray-700">
              {listing.city}, {listing.state} {listing.pincode}
            </p>
          </div>

          {listing.amenities && listing.amenities.length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-3 text-primary-900">
                Amenities
              </h2>
              <div className="flex flex-wrap gap-2">
                {listing.amenities.map((amenity, idx) => (
                  <span
                    key={idx}
                    className="bg-primary-100 text-primary-900 px-3 py-1 rounded-full text-sm"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:relative md:border-0 md:p-0 md:bg-transparent md:flex md:gap-4">
          <button
            onClick={() => navigate("/chat")}
            className="w-full md:flex-1 flex items-center justify-center gap-2 bg-primary-900 hover:bg-primary-800 text-white px-6 py-3 rounded-xl font-bold mb-3 md:mb-0 transition-colors"
          >
            <MessageCircle size={20} />
            Chat with Seller
          </button>
          <button
            onClick={() => navigate("/booking")}
            className="w-full md:flex-1 flex items-center justify-center gap-2 bg-white border-2 border-primary-900 text-primary-900 hover:bg-primary-50 px-6 py-3 rounded-xl font-bold transition-colors"
          >
            <Calendar size={20} />
            Request Booking
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;