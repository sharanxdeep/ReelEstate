import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Upload } from 'lucide-react'
import AuthContext from '../context/AuthContext'

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const EditProfile = () => {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [avatar, setAvatar] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    avatar: ''
  })

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/auth/${user.id}`, {
          credentials: 'include'
        })
        const data = await res.json()
        setProfile(data.user)
        setFormData({
          name: data.user.name,
          phone: data.user.phone,
          avatar: data.user.avatar || ''
        })
        setAvatarPreview(data.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.name}`)
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [user, navigate])

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatar(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      let avatarUrl = formData.avatar

      if (avatar) {
        const uploadData = new FormData()
        uploadData.append('file', avatar)
        uploadData.append('upload_preset', UPLOAD_PRESET)
        
        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
          method: 'POST',
          body: uploadData
        })
        const uploadResult = await uploadRes.json()
        avatarUrl = uploadResult.secure_url
      }


      const res = await fetch(`http://localhost:3000/api/auth/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          avatar: avatarUrl
        }),
        credentials: 'include'
      })

      if (res.ok) {
        alert('Profile updated successfully')
        navigate('/profile')
      } else {
        const data = await res.json()
        alert('Error: ' + (data.message || 'Failed to update'))
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Error saving profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-screen bg-black">Loading...</div>

  return (
    <div className="min-h-screen bg-black pt-24 pb-20 md:pt-20 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-primary-900 text-white p-6 flex items-center gap-4">
          <button
            onClick={() => navigate('/profile')}
            className="p-2 hover:bg-white/20 rounded-lg transition-all"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold">Edit Profile</h1>
        </div>

        {/* Form */}
        <div className="p-8">
          {/* Avatar Section */}
          <div className="mb-8 text-center">
            <img
              src={avatarPreview}
              alt="Avatar"
              className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-primary-900"
            />
            <label className="inline-flex items-center gap-2 bg-primary-900 text-white px-6 py-2 rounded-lg hover:bg-primary-800 cursor-pointer transition-all font-bold">
              <Upload size={18} />
              Change Avatar
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-primary-900 mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-3 border-2 border-primary-200 rounded-lg focus:outline-none focus:border-primary-900 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-primary-900 mb-2">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full p-3 border-2 border-primary-200 rounded-lg focus:outline-none focus:border-primary-900 transition-all"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={() => navigate('/profile')}
              className="flex-1 px-6 py-3 border-2 border-primary-900 text-primary-900 rounded-lg font-bold hover:bg-primary-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-6 py-3 bg-primary-900 text-white rounded-lg font-bold hover:bg-primary-800 transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditProfile