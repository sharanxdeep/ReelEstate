import { useState, useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import {
  Home,
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  Hash,
  Tag,
  X,
  Film,
  Trash2,
  Upload,
} from "lucide-react";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// Match to your real navbar heights.
const NAVBAR_H_DESKTOP = 80;
const NAVBAR_H_MOBILE = 64;
const CONTENT_TOP = NAVBAR_H_DESKTOP + 32;

const inputBase =
  "w-full bg-white/10 backdrop-blur-sm border border-white/15 text-white placeholder-white/45 rounded-4xl px-5 py-3.5 outline-none focus:border-[#C08A34]/70 focus:bg-white/15 transition-colors";

const labelBase = "block text-[11px] font-semibold tracking-[0.12em] uppercase text-[#BDD8E9]/70 mb-2 ml-1";

const Field = ({ label, icon: Icon, children }) => (
  <div>
    <label className={labelBase}>{label}</label>
    <div className="relative">
      {Icon && (
        <Icon size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#BDD8E9]/50 pointer-events-none" />
      )}
      {children}
    </div>
  </div>
);

const EditListing = () => {
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();

  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [amenityInput, setAmenityInput] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    houseNumber: "",
    street: "",
    locality: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    bedrooms: "",
    bathrooms: "",
    size: "",
    propertyType: "apartment",
    amenities: [],
    chapters: [],
  });

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/listings/${id}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) {
          setNotFound(true);
          return;
        }

        const listing = data.listing;

        if (listing.seller !== user.id) {
          navigate("/profile");
          return;
        }

        setFormData({
          title: listing.title || "",
          price: listing.price || "",
          houseNumber: listing.houseNumber || "",
          street: listing.street || "",
          locality: listing.locality || "",
          city: listing.city || "",
          state: listing.state || "",
          country: listing.country || "",
          pincode: listing.pincode || "",
          bedrooms: listing.bedrooms || "",
          bathrooms: listing.bathrooms || "",
          size: listing.size || "",
          propertyType: listing.propertyType || "apartment",
          amenities: listing.amenities || [],
          chapters: (listing.chapters || []).map((ch) => ({
            name: ch.name,
            videoUrl: ch.videoUrl,
            videoFile: null,
          })),
        });
      } catch (error) {
        setNotFound(true);
      } finally {
        setFetching(false);
      }
    };

    if (!user) {
      navigate("/login");
      return;
    }
    fetchListing();
  }, [id, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addAmenity = () => {
    const val = amenityInput.trim();
    if (!val) return;
    if (!formData.amenities.includes(val)) {
      setFormData((prev) => ({ ...prev, amenities: [...prev.amenities, val] }));
    }
    setAmenityInput("");
  };

  const removeAmenity = (val) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((a) => a !== val),
    }));
  };

  const addChapters = () => {
    setFormData((prev) => ({
      ...prev,
      chapters: [...prev.chapters, { name: "", videoFile: null, videoUrl: "" }],
    }));
  };

  const removeChapter = (index) => {
    setFormData((prev) => ({
      ...prev,
      chapters: prev.chapters.filter((_, i) => i != index),
    }));
  };

  const handleChapterChange = (index, field, value) => {
    const newChapters = [...formData.chapters];
    newChapters[index] = { ...newChapters[index], [field]: value };
    setFormData((prev) => ({ ...prev, chapters: newChapters }));
  };

  const uploadToCloudinary = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`,
      { method: "post", body: data },
    );
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || "Upload failed");
    return json.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const updatedChapters = await Promise.all(
        formData.chapters.map(async (chapter, index) => {
          if (chapter.videoFile) {
            const videoUrl = await uploadToCloudinary(chapter.videoFile);
            return { name: chapter.name, videoUrl, order: index };
          }
          if (!chapter.videoUrl)
            throw new Error(`Chapter ${chapter.name || index + 1} has no video`);
          return { name: chapter.name, videoUrl: chapter.videoUrl, order: index };
        }),
      );

      const { chapters, ...rest } = formData;

      const res = await fetch(`http://localhost:3000/api/listings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...rest, chapters: updatedChapters }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update listing");
      navigate("/profile");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching)
    return (
      <div className="flex items-center justify-center h-screen bg-[#001D39] text-[#BDD8E9]">
        Loading…
      </div>
    );
  if (notFound)
    return (
      <div className="flex items-center justify-center h-screen bg-[#001D39] text-[#BDD8E9]">
        Listing not found
      </div>
    );

  return (
    <div className="min-h-screen bg-[#001D39]">
      {/* Scrim so the translucent top navbar stays readable over the dark page */}
      <div
        className="hidden md:block fixed top-0 left-0 right-0 z-30 pointer-events-none"
        style={{
          height: NAVBAR_H_DESKTOP,
          background: `linear-gradient(to bottom, rgba(0,29,57,0.65) 0%, rgba(0,29,57,0.55) 55%, rgba(0,29,57,0) 100%)`,
        }}
      />

      <div
        className="max-w-2xl mx-auto px-5 md:px-8"
        style={{ paddingTop: CONTENT_TOP, paddingBottom: NAVBAR_H_MOBILE + 96 }}
      >
        <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[#C08A34] mb-2">
          Edit tour
        </p>
        <h1 className="font-display font-extrabold text-[32px] md:text-[40px] text-white leading-[1.1] mb-10">
          Edit your listing
        </h1>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Basic Info */}
          <section className="space-y-4">
            <Field label="Title" icon={Home}>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. 3BHK Luxury Apartment"
                className={`${inputBase} pl-12`}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Price (₹)">
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="9500000"
                  className={inputBase}
                />
              </Field>
              <Field label="Property type">
                <select
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleChange}
                  className={`${inputBase} appearance-none`}
                >
                  <option value="apartment">Apartment</option>
                  <option value="villa">Villa</option>
                  <option value="plot">Plot</option>
                  <option value="commercial">Commercial</option>
                  <option value="farmhouse">Farmhouse</option>
                </select>
              </Field>
            </div>
          </section>

          {/* Location */}
          <section className="space-y-4">
            <p className={labelBase}>Location</p>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="houseNumber"
                value={formData.houseNumber}
                onChange={handleChange}
                placeholder="House / plot no."
                className={inputBase}
              />
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleChange}
                placeholder="Street"
                className={inputBase}
              />
            </div>
            <Field icon={MapPin}>
              <input
                type="text"
                name="locality"
                value={formData.locality}
                onChange={handleChange}
                placeholder="Locality"
                className={`${inputBase} pl-12`}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                className={inputBase}
              />
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="State"
                className={inputBase}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="Country"
                className={inputBase}
              />
              <Field icon={Hash}>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="Pincode"
                  className={`${inputBase} pl-12`}
                />
              </Field>
            </div>
          </section>

          {/* Property Details */}
          <section className="space-y-4">
            <p className={labelBase}>Property details</p>
            <div className="grid grid-cols-3 gap-4">
              <Field icon={BedDouble}>
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  placeholder="Beds"
                  className={`${inputBase} pl-12`}
                />
              </Field>
              <Field icon={Bath}>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  placeholder="Baths"
                  className={`${inputBase} pl-12`}
                />
              </Field>
              <Field icon={Maximize}>
                <input
                  type="number"
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  placeholder="Sqft"
                  className={`${inputBase} pl-12`}
                />
              </Field>
            </div>
          </section>

          {/* Amenities */}
          <section className="space-y-4">
            <p className={labelBase}>Amenities</p>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Tag size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#BDD8E9]/50" />
                <input
                  type="text"
                  value={amenityInput}
                  onChange={(e) => setAmenityInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addAmenity();
                    }
                  }}
                  placeholder="e.g. Private pool — press enter"
                  className={`${inputBase} pl-12`}
                />
              </div>
              <button
                type="button"
                onClick={addAmenity}
                className="px-5 rounded-4xl bg-white/10 border border-white/15 text-white text-sm font-medium hover:bg-white/15 transition-colors"
              >
                Add
              </button>
            </div>
            {formData.amenities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.amenities.map((a) => (
                  <span
                    key={a}
                    className="flex items-center gap-1.5 bg-[#C08A34]/15 border border-[#C08A34]/30 text-[#F0D5A6] text-[13px] pl-3.5 pr-2 py-1.5 rounded-full"
                  >
                    {a}
                    <button
                      type="button"
                      onClick={() => removeAmenity(a)}
                      aria-label={`Remove ${a}`}
                      className="hover:text-white transition-colors"
                    >
                      <X size={13} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* Chapters */}
          <section className="space-y-4">
            <p className={labelBase}>Video tour</p>

            {formData.chapters.map((chapter, index) => (
              <div
                key={index}
                className="p-4 bg-white/[0.06] border border-white/10 rounded-4xl space-y-3"
              >
                <div className="flex items-center gap-2">
                  <Film size={16} className="text-[#BDD8E9]/50 shrink-0" />
                  <input
                    type="text"
                    placeholder="Chapter name, e.g. Living room"
                    value={chapter.name}
                    onChange={(e) => handleChapterChange(index, "name", e.target.value)}
                    className="flex-1 bg-transparent outline-none text-white placeholder-white/45 text-sm"
                  />
                </div>

                {chapter.videoUrl && !chapter.videoFile && (
                  <p className="text-[12px] text-[#BDD8E9]/60 pl-1">
                    Current video attached — upload a new file to replace it.
                  </p>
                )}

                <label className="flex items-center justify-center gap-2 w-full py-3 rounded-full border border-dashed border-white/20 text-white/60 text-[13px] cursor-pointer hover:border-white/40 transition-colors">
                  <Upload size={14} />
                  {chapter.videoFile ? chapter.videoFile.name : "Upload new video"}
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleChapterChange(index, "videoFile", e.target.files[0])}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => removeChapter(index)}
                  className="flex items-center gap-1.5 text-[#E29A9A] text-[13px] font-medium"
                >
                  <Trash2 size={13} />
                  Remove chapter
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addChapters}
              className="w-full py-3.5 rounded-4xl border border-white/20 text-white/80 text-sm font-medium hover:bg-white/5 transition-colors"
            >
              + Add chapter
            </button>
          </section>

          {error && (
            <div className="p-4 bg-[#E29A9A]/10 border border-[#E29A9A]/30 text-[#F5C6C6] rounded-3xl text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="flex-1 py-3.5 rounded-4xl border border-white/20 text-white font-medium hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3.5 rounded-4xl bg-[#C08A34] text-[#001D39] font-semibold hover:bg-[#D19B45] transition-colors disabled:opacity-50"
            >
              {loading ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditListing;