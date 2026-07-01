import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Upload } from 'lucide-react'
import AuthContext from '../context/AuthContext'

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// Match to your real navbar heights.
const NAVBAR_H_DESKTOP = 80
const NAVBAR_H_MOBILE = 64
const CONTENT_TOP = NAVBAR_H_DESKTOP + 32

const inputBase =
  "w-full bg-white/10 backdrop-blur-sm border border-white/15 text-white placeholder-white/45 rounded-4xl px-5 py-3.5 outline-none focus:border-[#C08A34]/70 focus:bg-white/15 transition-colors"

const labelBase = "block text-[11px] font-semibold tracking-[0.12em] uppercase text-[#BDD8E9]/70 mb-2 ml-1"

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

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-[#001D39] text-[#BDD8E9]">
        Loading…
      </div>
    )

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
          Account
        </p>
        <h1 className="font-display font-extrabold text-[32px] md:text-[40px] text-white leading-[1.1] mb-10">
          Edit profile
        </h1>

        <div className="space-y-10">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-4">
            <img
              src={avatarPreview}
              alt="Avatar"
              className="w-28 h-28 rounded-full object-cover border-4 border-white/20"
            />
            <label className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 text-white px-5 py-2.5 rounded-4xl hover:bg-white/15 cursor-pointer transition-colors text-sm font-medium">
              <Upload size={16} />
              Change avatar
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Form Fields */}
          <section className="space-y-4">
            <div>
              <label className={labelBase}>Full name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Your full name"
                className={inputBase}
              />
            </div>

            <div>
              <label className={labelBase}>Phone number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="e.g. 98765 43210"
                className={inputBase}
              />
            </div>
          </section>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => navigate('/profile')}
              className="flex-1 py-3.5 rounded-4xl border border-white/20 text-white font-medium hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3.5 rounded-4xl bg-[#C08A34] text-[#001D39] font-semibold hover:bg-[#D19B45] transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditProfile