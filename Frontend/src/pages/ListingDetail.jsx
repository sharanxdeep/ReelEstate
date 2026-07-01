import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MessageCircle,
  CalendarClock,
  Send,
  ChevronLeft,
  BedDouble,
  Bath,
  Maximize,
  Building2,
} from "lucide-react";

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const capitalize = (str) => (str ? str.replace(/\b\w/g, (c) => c.toUpperCase()) : str);

const formatPriceIndian = (price) => {
  if (!price) return "";
  if (price >= 1e7) return `₹${(price / 1e7).toFixed(price % 1e7 === 0 ? 0 : 2)}Cr`;
  if (price >= 1e5) return `₹${(price / 1e5).toFixed(price % 1e5 === 0 ? 0 : 1)}L`;
  return `₹${price.toLocaleString("en-IN")}`;
};

const FALLBACK_LISTING = {
  _id: "demo",
  title: "The Aravalli Retreat",
  price: 18500000,
  houseNumber: "12",
  street: "Ridgeview Lane",
  locality: "Aravalli Hills",
  city: "Gurugram",
  state: "Haryana",
  pincode: "122009",
  bedrooms: 4,
  bathrooms: 3,
  size: 3200,
  propertyType: "villa",
  amenities: ["Private pool", "Home theatre", "Solar backup", "Servant quarters"],
  views: 1240,
  seller: "demo-seller",
  chapters: [
    { name: "Exterior & garden", videoUrl: "" },
    { name: "Living room", videoUrl: "" },
  ],
};
const FALLBACK_SELLER = { name: "ritika anand", avatar: "" };

// Match these to your real navbar heights (px).
const NAVBAR_H_DESKTOP = 80;
const NAVBAR_H_MOBILE = 64;
const CONTENT_TOP = NAVBAR_H_DESKTOP + 24;

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedChapter, setSelectedChapter] = useState(0);
  const [avatarError, setAvatarError] = useState(false);

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
        if (!res.ok) throw new Error(data.message || "Failed to load listing");
        setListing(data.listing);
        if (data.listing.seller) await fetchSeller(data.listing.seller);
      } catch (error) {
        console.error("Error fetching listing, showing preview data:", error);
        setListing(FALLBACK_LISTING);
        setSeller(FALLBACK_SELLER);
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

  useEffect(() => {
    setIsPlaying(true);
    setCurrentTime(0);
  }, [selectedChapter]);

  useEffect(() => {
    setAvatarError(false);
  }, [seller?.avatar]);

  const handleTimeUpdate = () => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
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
      setShowPauseMsg(true);
      if (pauseMsgTimeoutRef.current) clearTimeout(pauseMsgTimeoutRef.current);
      pauseMsgTimeoutRef.current = setTimeout(() => setShowPauseMsg(false), 2000);
    }
  };

  useEffect(() => {
    return () => {
      if (pauseMsgTimeoutRef.current) clearTimeout(pauseMsgTimeoutRef.current);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#001D39] text-[#BDD8E9]">
        Loading tour…
      </div>
    );
  }
  if (!listing) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#001D39] text-[#BDD8E9]">
        Listing not found
      </div>
    );
  }

  const chapters = listing.chapters || [];
  const showProgressLine = chapters.length > 3;
  const tourProgress =
    chapters.length > 1 ? (selectedChapter / (chapters.length - 1)) * 100 : 100;

  const facts = [
    { icon: BedDouble, label: "Bedrooms", value: listing.bedrooms },
    { icon: Bath, label: "Bathrooms", value: listing.bathrooms },
    { icon: Maximize, label: "Size", value: `${listing.size} sqft` },
    { icon: Building2, label: "Type", value: listing.propertyType },
  ];

  return (
    <div className="min-h-screen bg-[#F6F3EC]">
      <div
        className="hidden md:block fixed top-0 left-0 right-0 z-30 pointer-events-none"
        style={{
          height: NAVBAR_H_DESKTOP,
          background: `linear-gradient(to bottom, rgba(0,29,57,0.65) 0%, rgba(0,29,57,0.55) 55%, rgba(0,29,57,0) 100%)`,
        }}
      />

      <div className="md:flex md:min-h-screen">
        <div className=" relative md:w-[46%] md:sticky md:top-0 md:h-screen bg-[#001D39] flex flex-col">
          <button
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="mt-20 absolute left-5 z-20 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
            style={{ top: 16 }}
          >
            <ChevronLeft size={20} />
          </button>

          <div
            className="flex-1 flex items-start justify-center px-6 pb-6 md:pb-8 pt-4"
            style={{ "--content-top": `${CONTENT_TOP}px` }}
          >
            <div className="relative w-full max-w-[300px] md:mt-[var(--content-top)]">
              <video
                key={chapters[selectedChapter]?.videoUrl}
                ref={videoRef}
                src={chapters[selectedChapter]?.videoUrl}
                autoPlay
                playsInline
                controls={false}
                controlsList="nodownload noplaybackrate"
                disablePictureInPicture
                onTimeUpdate={handleTimeUpdate}
                onClick={handleVideoTap}
                className="w-full bg-black rounded-2xl aspect-[9/16] cursor-pointer object-cover"
              />

              {showPauseMsg && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-white text-sm font-medium bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
                    Tap to {isPlaying ? "pause" : "play"}
                  </span>
                </div>
              )}

              <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                <span className="text-[11px] font-medium tracking-wide text-white/80 bg-black/35 backdrop-blur-sm px-2.5 py-1 rounded-full">
                  {chapters[selectedChapter]?.name || "Tour"}
                </span>
                {chapters.length > 0 && (
                  <span className="text-[11px] font-medium tracking-wide text-white/80 bg-black/35 backdrop-blur-sm px-2.5 py-1 rounded-full">
                    {selectedChapter + 1} / {chapters.length}
                  </span>
                )}
              </div>

              <div className="absolute bottom-4 left-0 right-0 flex justify-center px-4 pointer-events-none">
                <div className="flex items-center w-full max-w-[220px] bg-white/25 hover:bg-white/35 backdrop-blur-sm border border-white/50 rounded-full px-3 py-2 pointer-events-auto transition-colors">
                  <input
                    type="text"
                    placeholder={`Ask at ${formatTime(currentTime)}`}
                    className="flex-1 bg-transparent outline-none text-white placeholder-white/90 text-xs font-medium text-center"
                  />
                  <button
                    aria-label="Send question"
                    className="ml-1.5 text-white hover:text-white/80 transition-colors shrink-0"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {chapters.length > 0 && (
            <div className="px-6 pb-6 md:pb-8">
              <div className="relative">
                {showProgressLine && (
                  <>
                    <div className="absolute top-4 left-0 right-0 h-px bg-white/15" />
                    <div
                      className="absolute top-4 left-0 h-px bg-[#C08A34] transition-all duration-300"
                      style={{ width: `${tourProgress}%` }}
                    />
                  </>
                )}
                <div className="relative flex items-start justify-center gap-8 overflow-x-auto px-1 [scrollbar-width:none]">
                  {chapters.map((ch, idx) => {
                    const isActive = idx === selectedChapter;
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedChapter(idx)}
                        className="flex flex-col items-center gap-2 shrink-0 max-w-[72px] group"
                      >
                        <span
                          className={`rounded-full flex items-center justify-center font-semibold transition-all duration-200 ${
                            isActive
                              ? "w-10 h-10 text-xs bg-[#C08A34] text-[#001D39]"
                              : idx < selectedChapter
                              ? "w-7 h-7 text-[10px] bg-[#C08A34]/40 text-white"
                              : "w-7 h-7 text-[10px] bg-white/10 text-white/60 group-hover:bg-white/20"
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <span
                          className={`text-[10px] leading-tight text-center ${
                            isActive ? "text-white font-medium" : "text-white/50"
                          }`}
                        >
                          {ch.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* DETAILS PANEL */}
        <div className="md:w-[54%] px-5 md:px-12 pb-32 md:pb-16">
          <div
            className="max-w-xl pt-4"
            style={{ "--content-top": `${CONTENT_TOP}px` }}
          >
            <div className="hidden md:block" style={{ height: `var(--content-top)` }} />
            <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[#49769F] mb-2">
              {listing.city}, {listing.state}
            </p>
            <h1 className="font-display font-extrabold text-[32px] md:text-[40px] leading-[1.1] text-[#001D39] mb-3">
              {listing.title}
            </h1>
            <p className="font-display font-bold text-2xl md:text-[28px] text-[#0A4174] mb-8">
              Asking – {formatPriceIndian(listing.price)}
            </p>

            <div className="hidden md:flex gap-3 mb-10">
              <button
                onClick={() => navigate("/chat")}
                className="flex-1 flex items-center justify-center gap-2 bg-[#001D39] hover:bg-[#0A4174] text-white px-6 py-3 rounded-4xl font-medium transition-colors"
              >
                <MessageCircle size={18} />
                Chat with seller
              </button>
              <button
                onClick={() => navigate("/booking")}
                className="flex-1 flex items-center justify-center gap-2 bg-transparent border border-[#001D39] text-[#001D39] hover:bg-[#001D39]/5 px-6 py-3 rounded-4xl font-medium transition-colors"
              >
                <CalendarClock size={18} />
                Request a visit
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-8 pb-8 border-b border-[#001D39]/10">
              {facts.map((f, idx) => (
                <div key={idx}>
                  <f.icon size={18} className="text-[#49769F] mb-2" />
                  <p className="text-[15px] font-semibold text-[#001D39] capitalize leading-tight">
                    {f.value}
                  </p>
                  <p className="text-[11px] text-[#49769F]">{f.label}</p>
                </div>
              ))}
            </div>

            {seller && (
              <div className="flex items-center gap-3 mb-8 pb-8 border-b border-[#001D39]/10">
                <div className="w-12 h-12 rounded-full bg-[#BDD8E9] overflow-hidden flex items-center justify-center text-[#0A4174] font-semibold shrink-0">
                  {seller.avatar && !avatarError ? (
                    <img
                      src={seller.avatar}
                      alt={capitalize(seller.name)}
                      onError={() => setAvatarError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    capitalize(seller.name)?.[0]
                  )}
                </div>
                <div>
                  <p className="text-[15px] font-medium text-[#001D39]">
                    {capitalize(seller.name)}
                  </p>
                  <p className="text-[13px] text-[#49769F]">Usually responds within 2 hours</p>
                </div>
              </div>
            )}

            <div className="mb-8 pb-8 border-b border-[#001D39]/10">
              <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[#49769F] mb-3">
                Location
              </p>
              <p className="text-[15px] text-[#001D39]">
                {listing.houseNumber} {listing.street}, {listing.locality}
              </p>
              <p className="text-[15px] text-[#001D39]">
                {listing.city}, {listing.state} {listing.pincode}
              </p>
            </div>

            {listing.amenities && listing.amenities.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[#49769F] mb-3">
                  Amenities
                </p>
                <div className="flex flex-wrap gap-2">
                  {listing.amenities.map((amenity, idx) => (
                    <span
                      key={idx}
                      className="bg-[#BDD8E9]/40 text-[#0A4174] px-3 py-1.5 rounded-full text-[13px]"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className="fixed left-0 right-0 md:hidden bg-[#F6F3EC] border-t border-[#001D39]/10 p-4 flex gap-3"
        style={{ bottom: NAVBAR_H_MOBILE }}
      >
        <button
          onClick={() => navigate("/chat")}
          className="flex-1 flex items-center justify-center gap-2 bg-[#001D39] text-white px-4 py-3 rounded-xl font-medium"
        >
          <MessageCircle size={18} />
          Chat
        </button>
        <button
          onClick={() => navigate("/booking")}
          className="flex-1 flex items-center justify-center gap-2 border border-[#001D39] text-[#001D39] px-4 py-3 rounded-xl font-medium"
        >
          <CalendarClock size={18} />
          Request visit
        </button>
      </div>
    </div>
  );
};

export default ListingDetail;