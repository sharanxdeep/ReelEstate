import React, { useRef, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Volume2, VolumeX, ChevronRight, Heart, Share2 } from "lucide-react";
import AuthContext from "../context/AuthContext";

const ListingCard = ({ listing }) => {
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const { user, toggleSaveListing } = useContext(AuthContext);
  const [muted, setMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const isSaved = user?.savedProperties?.some(
    (p) => (p._id || p) === listing._id
  );
  const [optimisticSaved, setOptimisticSaved] = useState(null);
  const displaySaved = optimisticSaved !== null ? optimisticSaved : isSaved;

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

  const handleSave = async (e) => {
    e.stopPropagation();
    if (!user) {
      navigate("/login");
      return;
    }
    if (saving) return;

    setSaving(true);
    const nextState = !displaySaved;
    setOptimisticSaved(nextState);

    try {
      await toggleSaveListing(listing._id);
      setOptimisticSaved(null);
    } catch (error) {
      console.error("Error toggling save:", error);
      setOptimisticSaved(!nextState);
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/listing/${listing._id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("Error copying link:", error);
    }
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

        {/* Right side action stack: Save, Share, Mute */}
        <div className="absolute bottom-20 md:bottom-6 right-4 flex flex-col gap-3 z-20">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-sm transition-all disabled:opacity-50"
          >
            <Heart
              size={20}
              className={displaySaved ? "fill-red-500 text-red-500" : ""}
            />
          </button>

          <button
            onClick={handleShare}
            className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-sm transition-all relative"
          >
            <Share2 size={20} />
            {copied && (
              <span className="absolute right-full top-1/2 -translate-y-1/2 mr-2 whitespace-nowrap bg-black/80 text-white text-xs px-2 py-1 rounded">
                Link copied!
              </span>
            )}
          </button>

          <button
            onClick={toggleMute}
            className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full"
          >
            {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>

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
