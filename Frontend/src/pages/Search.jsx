import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search as SearchIcon,
  SlidersHorizontal,
  X,
  MapPin,
  BedDouble,
  Bath,
  Maximize,
} from "lucide-react";

const EMPTY_FILTERS = {
  city: "",
  propertyType: "",
  minPrice: "",
  maxPrice: "",
  bedrooms: "",
  bathrooms: "",
};

const Search = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [draftFilters, setDraftFilters] = useState(EMPTY_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/listings", {
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok) {
          setListings(data.listings || []);
        }
      } catch (error) {
        console.error("Error fetching listings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  // Derive filter options from the data itself, so nothing is hardcoded
  const cityOptions = useMemo(
    () => [...new Set(listings.map((l) => l.city).filter(Boolean))].sort(),
    [listings]
  );
  const typeOptions = useMemo(
    () =>
      [...new Set(listings.map((l) => l.propertyType).filter(Boolean))].sort(),
    [listings]
  );

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return listings.filter((l) => {
      if (
        q &&
        !`${l.title} ${l.city} ${l.state} ${l.country}`
          .toLowerCase()
          .includes(q)
      )
        return false;
      if (filters.city && l.city !== filters.city) return false;
      if (filters.propertyType && l.propertyType !== filters.propertyType)
        return false;
      if (filters.minPrice && l.price < Number(filters.minPrice)) return false;
      if (filters.maxPrice && l.price > Number(filters.maxPrice)) return false;
      if (filters.bedrooms && l.bedrooms < Number(filters.bedrooms))
        return false;
      if (filters.bathrooms && l.bathrooms < Number(filters.bathrooms))
        return false;
      return true;
    });
  }, [listings, query, filters]);

  const openFilters = () => {
    setDraftFilters(filters);
    setShowFilters(true);
  };

  const applyFilters = () => {
    setFilters(draftFilters);
    setShowFilters(false);
  };

  const resetFilters = () => {
    setDraftFilters(EMPTY_FILTERS);
    setFilters(EMPTY_FILTERS);
    setShowFilters(false);
  };

  return (
    <div className="min-h-screen bg-black pt-20 pb-24 md:pb-12">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        {/* Search bar */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm focus-within:border-primary-700 transition-colors">
            <SearchIcon size={18} className="text-gray-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, city, or state"
              className="flex-1 outline-none text-sm text-primary-900 placeholder-gray-400"
            />
            {query && (
              <button onClick={() => setQuery("")} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            )}
          </div>
          <button
            onClick={openFilters}
            className="relative flex items-center gap-2 bg-primary-900 hover:bg-primary-800 text-white px-4 py-3 rounded-xl shadow-sm transition-colors shrink-0"
          >
            <SlidersHorizontal size={18} />
            <span className="hidden sm:inline text-sm font-semibold">Filters</span>
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-primary-400 text-primary-900 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {Object.entries(filters).map(([key, value]) =>
              value ? (
                <span
                  key={key}
                  className="flex items-center gap-1.5 bg-primary-100 text-primary-900 text-xs font-semibold px-3 py-1.5 rounded-full"
                >
                  {value}
                  <button
                    onClick={() => setFilters((f) => ({ ...f, [key]: "" }))}
                    className="hover:text-primary-700"
                  >
                    <X size={12} />
                  </button>
                </span>
              ) : null
            )}
            <button
              onClick={resetFilters}
              className="text-xs font-semibold text-gray-500 hover:text-gray-700 px-2 py-1.5"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-24 text-gray-400">
            Loading listings...
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center text-gray-400">
            <SearchIcon size={32} className="mb-3" />
            <p className="font-medium">No listings match your search</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((listing) => (
              <button
                key={listing._id}
                onClick={() => navigate(`/listing/${listing._id}`)}
                className="text-left bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-video bg-primary-900">
                  {listing.chapters?.[0]?.videoUrl && (
                    <video
                      src={listing.chapters[0].videoUrl}
                      muted
                      preload="metadata"
                      className="w-full h-full object-cover"
                    />
                  )}
                  <span className="absolute top-2 right-2 bg-black/60 text-white text-xs font-semibold px-2 py-1 rounded-full capitalize">
                    {listing.propertyType}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-primary-900 truncate mb-1">
                    {listing.title}
                  </h3>
                  <p className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                    <MapPin size={12} />
                    {listing.city}, {listing.state}
                  </p>
                  <p className="text-lg font-bold text-primary-800 mb-3">
                    ₹{listing.price?.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-600 border-t border-gray-100 pt-3">
                    <span className="flex items-center gap-1">
                      <BedDouble size={14} /> {listing.bedrooms}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath size={14} /> {listing.bathrooms}
                    </span>
                    <span className="flex items-center gap-1">
                      <Maximize size={14} /> {listing.size} sqft
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filter modal — bottom sheet on mobile, centered panel on desktop */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowFilters(false)}
          />
          <div className="relative w-full md:max-w-md bg-white rounded-t-2xl md:rounded-2xl shadow-xl p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-primary-900">Filters</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5">
              {/* City */}
              <div>
                <label className="block text-sm font-semibold text-primary-900 mb-2">
                  City
                </label>
                <select
                  value={draftFilters.city}
                  onChange={(e) =>
                    setDraftFilters((f) => ({ ...f, city: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-primary-900 outline-none focus:border-primary-700"
                >
                  <option value="">Any city</option>
                  {cityOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Property type */}
              <div>
                <label className="block text-sm font-semibold text-primary-900 mb-2">
                  Property Type
                </label>
                <select
                  value={draftFilters.propertyType}
                  onChange={(e) =>
                    setDraftFilters((f) => ({
                      ...f,
                      propertyType: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-primary-900 outline-none focus:border-primary-700 capitalize"
                >
                  <option value="">Any type</option>
                  {typeOptions.map((t) => (
                    <option key={t} value={t} className="capitalize">
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price range */}
              <div>
                <label className="block text-sm font-semibold text-primary-900 mb-2">
                  Price Range (₹)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder="Min"
                    value={draftFilters.minPrice}
                    onChange={(e) =>
                      setDraftFilters((f) => ({
                        ...f,
                        minPrice: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-primary-900 outline-none focus:border-primary-700"
                  />
                  <span className="text-gray-400">—</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={draftFilters.maxPrice}
                    onChange={(e) =>
                      setDraftFilters((f) => ({
                        ...f,
                        maxPrice: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-primary-900 outline-none focus:border-primary-700"
                  />
                </div>
              </div>

              {/* Bedrooms / Bathrooms */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-primary-900 mb-2">
                    Min Bedrooms
                  </label>
                  <select
                    value={draftFilters.bedrooms}
                    onChange={(e) =>
                      setDraftFilters((f) => ({
                        ...f,
                        bedrooms: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-primary-900 outline-none focus:border-primary-700"
                  >
                    <option value="">Any</option>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n}+
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary-900 mb-2">
                    Min Bathrooms
                  </label>
                  <select
                    value={draftFilters.bathrooms}
                    onChange={(e) =>
                      setDraftFilters((f) => ({
                        ...f,
                        bathrooms: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-primary-900 outline-none focus:border-primary-700"
                  >
                    <option value="">Any</option>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n}+
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-8">
              <button
                onClick={resetFilters}
                className="flex-1 border-2 border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-3 rounded-xl font-bold transition-colors"
              >
                Reset
              </button>
              <button
                onClick={applyFilters}
                className="flex-1 bg-primary-900 hover:bg-primary-800 text-white px-4 py-3 rounded-xl font-bold transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;