import { useState, useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import Footer from "../components/Footer";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const EditListing = () => {
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();

  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    city: "",
    state: "",
    country: "",
    bedrooms: "",
    bathrooms: "",
    size: "",
    propertyType: "apartment",
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
          city: listing.city || "",
          state: listing.state || "",
          country: listing.country || "",
          bedrooms: listing.bedrooms || "",
          bathrooms: listing.bathrooms || "",
          size: listing.size || "",
          propertyType: listing.propertyType || "apartment",
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
      {
        method: "post",
        body: data,
      },
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
            throw new Error(
              `Chapter ${chapter.name || index + 1} has no video`,
            );
          return { name: chapter.name, videoUrl: chapter.videoUrl, order: index };
        }),
      );

      const { chapters, ...rest } = formData;

      const res = await fetch(`http://localhost:3000/api/listings/${id}`, {
        method: "patch",
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

  if (fetching) return <div className="flex items-center justify-center h-screen bg-primary-300">Loading...</div>;
  if (notFound) return <div className="flex items-center justify-center h-screen bg-primary-300">Listing not found</div>;

  return (
    <div className="min-h-screen bg-primary-300 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-4xl font-bold text-primary-900 mb-8">
          Edit Listing
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div>
            <label className="block text-sm font-bold text-primary-900 mb-2">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., 3BHK Luxury Apartment"
              className="w-full p-3 border border-primary-200 rounded-lg focus:outline-none focus:border-primary-900"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-primary-900 mb-2">
              Price (₹)
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="e.g., 9500000"
              className="w-full p-3 border border-primary-200 rounded-lg focus:outline-none focus:border-primary-900"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <input
              type="number"
              name="bedrooms"
              placeholder="Bedrooms"
              value={formData.bedrooms}
              onChange={handleChange}
              className="p-3 border border-primary-200 rounded-lg"
            />
            <input
              type="number"
              name="bathrooms"
              placeholder="Bathrooms"
              value={formData.bathrooms}
              onChange={handleChange}
              className="p-3 border border-primary-200 rounded-lg"
            />
            <input
              type="number"
              name="size"
              placeholder="Size (sqft)"
              value={formData.size}
              onChange={handleChange}
              className="p-3 border border-primary-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-primary-900 mb-2">
              Property Type
            </label>
            <select
              name="propertyType"
              value={formData.propertyType}
              onChange={handleChange}
              className="w-full p-3 border border-primary-200 rounded-lg"
            >
              <option value="apartment">Apartment</option>
              <option value="villa">Villa</option>
              <option value="plot">Plot</option>
              <option value="commercial">Commercial</option>
              <option value="farmhouse">Farmhouse</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-bold text-primary-900 mb-2">
              City
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="e.g., Chandigarh"
              className="w-full p-3 border border-primary-200 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="State"
              className="p-3 border border-primary-200 rounded-lg"
            />
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="Country"
              className="p-3 border border-primary-200 rounded-lg"
            />
          </div>

          {/* Chapters Section */}
          <div className="border-t pt-8 mt-8">
            <h2 className="text-2xl font-bold text-primary-900 mb-4">
              Videos
            </h2>

            {formData.chapters.map((chapter, index) => (
              <div key={index} className="mb-4 p-4 bg-primary-100 rounded-lg">
                <input
                  type="text"
                  placeholder="Chapter name (e.g., Overview)"
                  value={chapter.name}
                  onChange={(e) =>
                    handleChapterChange(index, "name", e.target.value)
                  }
                  className="w-full p-2 border rounded mb-2"
                />

                {chapter.videoUrl && !chapter.videoFile && (
                  <p className="text-sm text-primary-700 mb-2">
                    Current video attached — upload a new file to replace it.
                  </p>
                )}

                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) =>
                    handleChapterChange(index, "videoFile", e.target.files[0])
                  }
                  className="w-full p-2 border rounded mb-2"
                />
                <button
                  type="button"
                  onClick={() => removeChapter(index)}
                  className="text-red-600 font-bold"
                >
                  Remove
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addChapters}
              className="w-full p-3 border-2 border-primary-900 text-primary-900 rounded-lg font-bold"
            >
              + Add Chapter
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="flex-1 border-2 border-primary-900 text-primary-900 p-3 rounded-lg font-bold hover:bg-primary-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary-900 text-white p-3 rounded-lg font-bold hover:bg-primary-800 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default EditListing;