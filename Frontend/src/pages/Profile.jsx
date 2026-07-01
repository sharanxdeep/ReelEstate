import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Edit2,
  LogOut,
  Heart,
  Home,
  Calendar,
  Check,
  X,
  Eye,
  Trash2,
} from "lucide-react";
import AuthContext from "../context/AuthContext";

// Match to your real navbar heights.
const NAVBAR_H_DESKTOP = 80;
const NAVBAR_H_MOBILE = 64;

const Profile = () => {
  const { user, logout, toggleSaveListing } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [savedListings, setSavedListings] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("saved");


  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/auth/${user.id}`, {
          credentials: "include",
        });
        const data = await res.json();
        setProfile(data.user);
        setSavedListings(data.user.savedProperties || []);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    const fetchMyListings = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/listings`, {
          credentials: "include",
        });
        const data = await res.json();
        const userListings = data.listings.filter(
          (listing) => listing.seller === user.id,
        );
        setMyListings(userListings);
        if (userListings.length > 0) {
          setActiveTab("listed");
        }
      } catch (error) {
        console.error("Error fetching listings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    fetchMyListings();
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleEdit = (e, listingId) => {
    e.stopPropagation();
    navigate(`/edit-listing/${listingId}`);
  };

  const handleDelete = async (e, listingId) => {
    e.stopPropagation();

    if (!window.confirm("Are you sure you want to delete this listing?")) {
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:3000/api/listings/${listingId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        },
      );

      if (res.ok) {
        setMyListings(
          myListings.filter((listing) => listing._id !== listingId),
        );
        alert("Listing deleted successfully");
      } else {
        const data = await res.json();
        alert("Error: " + (data.message || "Failed to delete"));
      }
    } catch (error) {
      console.error("Error deleting listing:", error);
      alert("Error deleting listing");
    }
  };

  const handleRemoveSaved = async (e, listingId) => {
    e.stopPropagation();
    try {
      await toggleSaveListing(listingId);
      setSavedListings((prev) => prev.filter((prop) => prop._id !== listingId));
    } catch (error) {
      console.error("Error removing saved listing:", error);
    }
  };

  const getAvatarUrl = (name) => {
    if (!name) return `https://api.dicebear.com/7.x/avataaars/svg?seed=default`;
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`;
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-[#001D39]">
        Loading...
      </div>
    );
  if (!profile)
    return (
      <div className="flex items-center justify-center h-screen bg-[#001D39] text-white">
        Profile not found
      </div>
    );

  return (
    <div className="min-h-screen w-full bg-[#001D39]">
      {/* Scrim so the translucent top navbar stays readable over the glass header (desktop only) */}
      <div
        className="hidden md:block fixed top-0 left-0 right-0 z-30 pointer-events-none"
        style={{
          height: NAVBAR_H_DESKTOP,
          background: `linear-gradient(to bottom, rgba(0,29,57,0.65) 0%, rgba(0,29,57,0.55) 55%, rgba(0,29,57,0) 100%)`,
        }}
      />

      <div className="w-full min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden md:mt-16">
          {/* Profile Header — glass */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 text-white p-5 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
              <div className="flex items-center gap-4 md:gap-6">
                <img
                  src={profile.avatar || getAvatarUrl(profile.name)}
                  alt={profile.name}
                  className="w-16 h-16 md:w-24 md:h-24 rounded-full object-cover border-4 border-white shrink-0"
                />
                <div>
                  <h1 className="text-xl md:text-3xl font-bold">{profile.name}</h1>
                  <p className="text-white/80 text-sm md:text-base">{profile.phone}</p>
                  <p className="text-xs md:text-sm text-white/60 mt-1">Member since 2024</p>
                </div>
              </div>
              <div className="flex flex-row sm:flex-col gap-2">
                <button
                  onClick={() => navigate("/edit-profile")}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-4xl backdrop-blur-sm border border-white/20 font-bold transition-all text-sm md:text-base"
                >
                  <Edit2 size={18} />
                  Edit
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-4xl backdrop-blur-sm border border-white/20 font-bold transition-all text-sm md:text-base"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Lower section — solid white */}
          <div className="bg-white">
            {/* Seller Stats */}
            {profile.role === "seller" && (
              <div className="grid grid-cols-3 gap-2 md:gap-4 p-4 md:p-8 bg-primary-50 border-b border-gray-200">
                <div className="text-center">
                  <p className="text-xl md:text-3xl font-bold text-primary-900">
                    {myListings.length}
                  </p>
                  <p className="text-[11px] md:text-sm text-gray-600">Properties Listed</p>
                </div>
                <div className="text-center">
                  <p className="text-xl md:text-3xl font-bold text-primary-900">150</p>
                  <p className="text-[11px] md:text-sm text-gray-600">Views This Month</p>
                </div>
                <div className="text-center">
                  <p className="text-xl md:text-3xl font-bold text-primary-900">2h</p>
                  <p className="text-[11px] md:text-sm text-gray-600">Avg Response Time</p>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-gray-200 overflow-x-auto">
              <button
                onClick={() => setActiveTab("saved")}
                className={`flex-1 flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-6 py-3 md:py-4 font-bold transition-all text-xs md:text-base whitespace-nowrap ${
                  activeTab === "saved"
                    ? "text-primary-900 border-b-2 border-primary-900"
                    : "text-gray-600 hover:text-primary-900"
                }`}
              >
                <Heart size={18} />
                Saved
              </button>
              <button
                onClick={() => setActiveTab("listed")}
                className={`flex-1 flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-6 py-3 md:py-4 font-bold transition-all text-xs md:text-base whitespace-nowrap ${
                  activeTab === "listed"
                    ? "text-primary-900 border-b-2 border-primary-900"
                    : "text-gray-600 hover:text-primary-900"
                }`}
              >
                <Home size={18} />
                My Listings
              </button>
              <button
                onClick={() => setActiveTab("visits")}
                className={`flex-1 flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-6 py-3 md:py-4 font-bold transition-all text-xs md:text-base whitespace-nowrap ${
                  activeTab === "visits"
                    ? "text-primary-900 border-b-2 border-primary-900"
                    : "text-gray-600 hover:text-primary-900"
                }`}
              >
                <Calendar size={18} />
                Visits
              </button>
            </div>

            {/* Content */}
            <div className="p-4 md:p-8">
              {/* Saved Properties */}
              {activeTab === "saved" && (
                <div>
                  {savedListings && savedListings.length > 0 ? (
                    <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2">
                      {savedListings.map((prop, idx) => (
                        <div
                          key={idx}
                          onClick={() => navigate(`/listing/${prop._id}`)}
                          className="relative rounded-lg overflow-hidden cursor-pointer group"
                        >
                          <div className="w-full aspect-9/16 bg-gray-200 relative">
                            <video
                              src={prop.chapters?.[0]?.videoUrl}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />

                            {/* Remove Button - Top Right */}
                            <div className="absolute top-2 right-2 z-20">
                              <button
                                onClick={(e) => handleRemoveSaved(e, prop._id)}
                                className="bg-white/20 hover:bg-white/30 text-white p-1.5 rounded backdrop-blur-sm border border-white/20 transition-all"
                              >
                                <X size={12} />
                              </button>
                            </div>

                            {/* Content Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-2 z-10">
                              <p className="text-white text-xs font-bold line-clamp-2 mb-0.5">
                                {prop.title}
                              </p>
                              <p className="text-white/90 text-xs font-semibold">
                                ₹{(prop.price / 100000).toFixed(0)}L
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Heart size={48} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-600">No saved properties yet</p>
                    </div>
                  )}
                </div>
              )}

              {/* My Listings */}
              {activeTab === "listed" && (
                <div>
                  {myListings && myListings.length > 0 ? (
                    <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2">
                      {myListings.map((prop, idx) => (
                        <div
                          key={idx}
                          onClick={() => navigate(`/listing/${prop._id}`)}
                          className="relative rounded-lg overflow-hidden cursor-pointer group"
                        >
                          <div className="w-full aspect-9/16 bg-gray-200 relative">
                            <video
                              src={prop.chapters?.[0]?.videoUrl}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />

                            {/* Status Badge - Top Left */}
                            <span
                              className={`absolute top-2 left-2 text-[10px] px-1.5 py-0.5 rounded font-bold z-10 ${
                                prop.status === "live"
                                  ? "bg-green-500 text-white"
                                  : "bg-yellow-500 text-white"
                              }`}
                            >
                              {prop.status.toUpperCase()}
                            </span>

                            {/* Edit & Delete Buttons - Top Right */}
                            <div className="absolute top-2 right-2 flex gap-1 z-20">
                              <button
                                onClick={(e) => handleEdit(e, prop._id)}
                                className="bg-white/20 hover:bg-white/30 text-white p-1.5 rounded backdrop-blur-sm border border-white/20 transition-all"
                              >
                                <Edit2 size={12} />
                              </button>
                              <button
                                onClick={(e) => handleDelete(e, prop._id)}
                                className="bg-white/20 hover:bg-white/30 text-white p-1.5 rounded backdrop-blur-sm border border-white/20 transition-all"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>

                            {/* Content Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-2 z-10">
                              <p className="text-white text-xs font-bold line-clamp-2 mb-0.5">
                                {prop.title}
                              </p>
                              <p className="text-white/90 text-xs font-semibold">
                                ₹{(prop.price / 100000).toFixed(0)}L
                              </p>
                            </div>

                            {/* Views Text - Bottom Right */}
                            <div className="absolute bottom-2 right-2 text-white text-[10px] z-10 flex items-center gap-0.5">
                              <Eye size={10} />
                              <span>{prop.views || 0}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Home size={48} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-600 mb-4">No properties listed yet</p>
                      <button
                        onClick={() => navigate("/create-listing")}
                        className="bg-primary-900 text-white px-6 py-2 rounded-lg hover:bg-primary-800 font-bold transition-all"
                      >
                        List a Property
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Scheduled Visits */}
              {activeTab === "visits" && (
                <div>
                  <div className="space-y-4">
                    {/* Sample visit card - replace with actual data */}
                    <div className="bg-gray-50 rounded-lg p-4 md:p-6 border-2 border-gray-200">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex-1">
                          <p className="font-bold text-primary-900 mb-1">
                            Luxury Apartment, Chandigarh
                          </p>
                          <p className="text-sm text-gray-600 mb-2">
                            Scheduled: March 15, 2025 at 3:00 PM
                          </p>
                          <p className="text-sm text-gray-600 mb-3">
                            Visitor: John Doe
                          </p>
                          <span className="inline-block text-xs px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 font-bold">
                            PENDING
                          </span>
                        </div>
                        {profile.role === "seller" && (
                          <div className="flex gap-2">
                            <button className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all">
                              <Check size={16} />
                              Accept
                            </button>
                            <button className="flex items-center gap-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all">
                              <X size={16} />
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Accepted visit card */}
                    <div className="bg-gray-50 rounded-lg p-4 md:p-6 border-2 border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-bold text-primary-900 mb-1">
                            Modern Villa, Delhi
                          </p>
                          <p className="text-sm text-gray-600 mb-2">
                            Scheduled: March 20, 2025 at 5:00 PM
                          </p>
                          <p className="text-sm text-gray-600 mb-3">
                            Visitor: Jane Smith
                          </p>
                          <span className="inline-block text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 font-bold">
                            ACCEPTED
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;