import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  ChevronDown,
  Eye,
  EyeOff,
  Globe,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Megaphone,
  Phone,
  Route as RouteIcon,
  ShieldCheck,
  User,
} from 'lucide-react'

import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { divisions } from '../../data/mockMaster'
import { ROLES } from '../../utils/constants'
import { storage } from '../../services/storage'

export default function Register() {
  const { login } = useAuth()
  const { t, lang, languages, setLanguage } = useLanguage()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError(t('registerPage.pwdMismatch'))
      return
    }

    setSubmitting(true)
    try {
      const users = storage.getUsers()
      const existing = users.find(
        (u) => u.loginId === formData.mobile || u.mobile === formData.mobile
      )
      if (existing) {
        setError(t('registerPage.mobileExists'))
        setSubmitting(false)
        return
      }

      const newUser = {
        id: `USR-C${Date.now().toString().slice(-4)}`,
        role: ROLES.CITIZEN,
        loginId: formData.mobile,
        password: formData.password,
        name: formData.name,
        nameMr: formData.name,
        mobile: formData.mobile,
        email: formData.email,
        address: formData.address,
        divisionId: formData.divisionId,
        areaId: formData.areaId,
        language: lang,
        joinedOn: new Date().toISOString().slice(0, 10),
      }

      storage.setUsers([...users, newUser])
      await login(newUser.loginId, newUser.password)
      navigate('/citizen')
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedDiv = divisions.find((d) => d.id === formData.divisionId)

  const features = [
    { icon: Megaphone, label: t('loginPage.featureRegister') },
    { icon: RouteIcon, label: t('loginPage.featureTrack') },
    { icon: ShieldCheck, label: t('loginPage.featureTransparent') },
  ]

  return (
    <div className="relative min-h-dvh w-full overflow-x-hidden bg-gradient-to-br from-[#fffaf6] via-[#fff7f0] to-[#f9e9dc] lg:h-dvh lg:overflow-hidden">
      {/* ===== BACKGROUND GLOW ===== */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_20%_30%,rgba(255,255,255,0.9),transparent_55%),radial-gradient(ellipse_at_90%_90%,rgba(246,222,203,0.7),transparent_50%)]" />

      {/* ===== INDUSTRIAL PHOTO - BOTTOM LEFT ===== */}
      <div className="pointer-events-none absolute bottom-0 left-0 z-0 hidden h-[66%] w-[100%] lg:block">
        <div
          className="absolute inset-0"
          style={{
            WebkitMaskImage:
              'linear-gradient(to right, #000 66%, transparent 100%), linear-gradient(to bottom, transparent 0%, #000 32%)',
            maskImage:
              'linear-gradient(to right, #000 66%, transparent 100%), linear-gradient(to bottom, transparent 0%, #000 32%)',
            WebkitMaskComposite: 'source-in',
            maskComposite: 'intersect',
          }}
        >
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 1000 500"
            preserveAspectRatio="none"
          >
            <image
              href="/images/login-bg.jpg"
              x="0"
              y="0"
              width="1000"
              height="500"
              preserveAspectRatio="xMidYMid slice"
            />
          </svg>

          {/* soft wave over the bottom */}
          <svg
            className="absolute inset-x-0 bottom-0 h-[20%] w-full"
            viewBox="0 0 1000 160"
            preserveAspectRatio="none"
          >
            <path
              d="M0 70 C150 10 300 20 480 70 C650 120 820 140 1000 110 L1000 160 L0 160 Z"
              fill="#fffaf6"
              fillOpacity="0.95"
            />
          </svg>
        </div>
      </div>

      {/* ===== HEADER ===== */}
      <header className="relative z-20 flex h-[88px] shrink-0 items-center justify-between gap-3 px-5 sm:px-8 lg:h-[104px] lg:px-14">
        <div className="flex items-center gap-3 sm:gap-4 lg:gap-5">
          <img
            src="/logo.png"
            alt="MIDC Logo"
            className="h-12 w-12 shrink-0 object-contain sm:h-16 sm:w-16 lg:h-[78px] lg:w-[78px]"
          />

          <div className="leading-tight">
            <h2 className="font-display text-2xl font-bold text-[#a52e19] sm:text-3xl">
              MIDC
            </h2>
            <p className="mt-1 max-w-[170px] text-[11px] leading-snug text-[#29221e] sm:text-xs">
              {t('loginPage.orgName')}
            </p>
          </div>

          <div className="mx-2 hidden h-[70px] w-px bg-[#e6cdbd] md:block" />

          <h3 className="hidden max-w-[190px] font-display text-xl font-bold leading-tight text-[#171c32] lg:block">
            {t('loginPage.portalName')}
          </h3>

          <span className="hidden whitespace-nowrap rounded-xl bg-[#fceade] px-4 py-2 text-sm font-medium text-[#8d321d] shadow-sm xl:block">
            {t('loginPage.platformTag')}
          </span>
        </div>

        {/* LANGUAGE SELECTOR */}
        <div className="relative shrink-0">
          <Globe className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#4b4440]" />
          <select
            value={lang}
            onChange={(e) => setLanguage(e.target.value)}
            className="cursor-pointer appearance-none rounded-xl border border-[#eadbce] bg-white py-2.5 pl-10 pr-9 text-sm font-medium text-[#29221e] shadow-[0_2px_8px_rgba(100,55,30,0.08)] outline-none focus:border-[#c45b3b]"
          >
            {languages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.native}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4b4440]" />
        </div>
      </header>

      {/* ===== MAIN CONTAINER ===== */}
      <main className="relative z-10 grid grid-cols-1 gap-8 px-5 pb-8 pt-4 sm:px-8 lg:h-[calc(100dvh-104px)] lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_560px] lg:items-center lg:gap-10 lg:overflow-hidden lg:px-14 lg:pb-3 lg:pt-0">
        {/* LEFT HERO */}
        <section className="relative z-10 lg:-translate-y-24">
          <div className="flex items-center gap-4">
            <span className="font-display text-sm font-bold uppercase tracking-[0.3em] text-[#b83f25]">
              {t('loginPage.welcome')}
            </span>
            <span className="h-px w-20 bg-[#c9583a] sm:w-24" />
          </div>

          <h1 className="mt-4 font-display text-4xl font-bold leading-[1.12] tracking-tight text-[#29221e] sm:text-5xl lg:whitespace-nowrap lg:text-[52px] xl:text-[56px]">
            {t('loginPage.heroTitle')}
          </h1>

          <p className="mt-3 max-w-[620px] text-base leading-snug text-[#211f1e] sm:text-[22px] sm:leading-[1.3]">
            {t('loginPage.heroSubtitle')}
          </p>

          <div className="mt-7 flex flex-wrap gap-3 sm:gap-4">
            {features.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex min-h-[78px] min-w-[190px] items-center gap-4 rounded-2xl border border-[#f0e1d5] bg-white/85 px-5 py-3 shadow-[0_6px_16px_rgba(100,55,30,0.09)] backdrop-blur-md transition duration-200 hover:-translate-y-1 hover:bg-white"
              >
                <Icon
                  className="h-8 w-8 shrink-0 text-[#b53c22]"
                  strokeWidth={1.7}
                />
                <span className="max-w-[112px] font-display text-[17px] font-semibold leading-snug text-[#29221e]">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* RIGHT: REGISTRATION CARD */}
        <section className="relative z-10 flex w-full items-center justify-center">
          <div className="w-full max-w-[540px] rounded-[28px] border border-white/80 bg-white/90 p-6 shadow-raised backdrop-blur-xl sm:p-7 max-h-[85vh] overflow-y-auto">
            {/* Back link + Heading */}
            <div className="flex items-center justify-between mb-3">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 font-display text-xs font-semibold text-brand-600 transition hover:text-brand-800"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>{t('registerPage.backToLogin')}</span>
              </Link>

              <span className="rounded-full bg-brand-50 px-3 py-0.5 text-[11px] font-bold text-brand-700 border border-brand-200/80">
                Citizen Portal
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#f0dfd5] bg-white shadow-sm">
                <img
                  src="/logo.png"
                  alt="MIDC Official Logo"
                  className="h-11 w-11 object-contain"
                />
              </div>

              <div className="min-w-0">
                <h2 className="font-display text-xl font-bold leading-tight tracking-tight text-ink-900 sm:text-[22px]">
                  {t('registerPage.title')}
                </h2>
                <p className="mt-0.5 text-xs text-ink-500">
                  {t('registerPage.subtitle')}
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleRegister} className="mt-4 space-y-3.5" noValidate>
              {/* Full Name */}
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('registerPage.fullNamePlaceholder')}
                  className="peer h-11 w-full rounded-xl border border-cream-300 bg-white pl-11 pr-4 text-sm text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                />
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 transition peer-focus:text-brand-600" />
              </div>

              {/* Mobile + Email (side by side on sm) */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder={t('registerPage.mobilePlaceholder')}
                    className="peer h-11 w-full rounded-xl border border-cream-300 bg-white pl-11 pr-4 text-sm text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                  />
                  <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 transition peer-focus:text-brand-600" />
                </div>

                <div className="relative">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder={t('registerPage.emailPlaceholder')}
                    className="peer h-11 w-full rounded-xl border border-cream-300 bg-white pl-11 pr-4 text-sm text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                  />
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 transition peer-focus:text-brand-600" />
                </div>
              </div>

              {/* Division + Industrial Area (side by side) */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="relative">
                  <select
                    value={formData.divisionId}
                    onChange={(e) => {
                      const divId = e.target.value
                      const d = divisions.find((x) => x.id === divId)
                      setFormData({
                        ...formData,
                        divisionId: divId,
                        areaId: d?.areas?.[0]?.id || '',
                      })
                    }}
                    className="h-11 w-full cursor-pointer appearance-none rounded-xl border border-cream-300 bg-white pl-10 pr-8 text-xs font-semibold text-ink-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                  >
                    {divisions.map((d) => (
                      <option key={d.id} value={d.id}>
                        {lang === 'mr' ? d.nameMr : d.name}
                      </option>
                    ))}
                  </select>
                  <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                </div>

                <div className="relative">
                  <select
                    value={formData.areaId}
                    onChange={(e) => setFormData({ ...formData, areaId: e.target.value })}
                    className="h-11 w-full cursor-pointer appearance-none rounded-xl border border-cream-300 bg-white pl-10 pr-8 text-xs font-semibold text-ink-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                  >
                    {selectedDiv?.areas?.map((a) => (
                      <option key={a.id} value={a.id}>
                        {lang === 'mr' ? a.nameMr : a.name}
                      </option>
                    ))}
                  </select>
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={t('registerPage.password')}
                    autoComplete="new-password"
                    className="peer h-11 w-full rounded-xl border border-cream-300 bg-white pl-10 pr-10 text-xs text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                  />
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 transition peer-focus:text-brand-600" />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-ink-400 hover:text-ink-900"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder={t('registerPage.confirmPassword')}
                    autoComplete="new-password"
                    className="peer h-11 w-full rounded-xl border border-cream-300 bg-white pl-10 pr-10 text-xs text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                  />
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 transition peer-focus:text-brand-600" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((s) => !s)}
                    className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-ink-400 hover:text-ink-900"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <Link
  to="/login"
  className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-brand-500 to-brand-700 font-display text-sm font-semibold text-white shadow-brand transition-all duration-200 hover:-translate-y-0.5 hover:from-brand-600 hover:to-brand-800"
>
  <span>Sign In</span>
  <ArrowRight className="h-4 w-4" />
</Link>
            </form>

            {/* Footer */}
            <div className="mt-4 border-t border-cream-200 pt-3">
              <p className="text-center text-xs text-ink-500">
                {t('registerPage.alreadyUser')}{' '}
                <Link
                  to="/login"
                  className="ml-1 font-display font-semibold text-brand-600 transition hover:text-brand-800"
                >
                  {t('registerPage.signInNow')} &rarr;
                </Link>
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
