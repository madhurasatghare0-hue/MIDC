import { useState } from 'react'
import { User, Phone, Mail, MapPin, Globe, Shield, Save } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'

export default function Profile() {
  const { user } = useAuth()
  const { t, lang, setLanguage } = useLanguage()

  const [saved, setSaved] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || 'Rahul Deshmukh',
    mobile: user?.mobile || '9876543210',
    email: user?.email || 'rahul.deshmukh@example.com',
    address: user?.address || 'Plot C-24, Andheri MIDC, Mumbai',
  })

  const handleSave = (e) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink-900 tracking-tight">
          {t('nav.profile')}
        </h1>
        <p className="text-xs text-ink-500 mt-1">Manage your citizen profile and contact information.</p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200/90 shadow-card space-y-6">
        {/* User Card */}
        <div className="flex items-center gap-4 pb-6 border-b border-cream-200">
          <div className="w-16 h-16 rounded-2xl bg-brand-100 border border-brand-200 flex items-center justify-center text-brand-700 text-2xl font-bold">
            {formData.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-ink-900">{formData.name}</h3>
            <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
              Verified Citizen
            </span>
          </div>
        </div>

        {saved && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl font-medium">
            Profile updated successfully.
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="text-ink-600 font-bold block mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-ink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-cream-300 bg-cream-50/40 text-ink-900 text-xs focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          <div>
            <label className="text-ink-600 font-bold block mb-1">Mobile Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-ink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-cream-300 bg-cream-50/40 text-ink-900 text-xs focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          <div>
            <label className="text-ink-600 font-bold block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-ink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-cream-300 bg-cream-50/40 text-ink-900 text-xs focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          <div>
            <label className="text-ink-600 font-bold block mb-1">Registered Industrial Address</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-ink-400 absolute left-3.5 top-3" />
              <textarea
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-cream-300 bg-cream-50/40 text-ink-900 text-xs focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs transition shadow-brand cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
