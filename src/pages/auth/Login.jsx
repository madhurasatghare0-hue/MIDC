import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  ChevronDown,
  Eye,
  EyeOff,
  Fingerprint,
  Globe,
  Info,
  Loader2,
  Lock,
  Megaphone,
  Route as RouteIcon,
  Settings,
  ShieldCheck,
  Smartphone,
  User,
  Users,
  UsersRound,
} from 'lucide-react'

import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { ROLES } from '../../utils/constants'

const REMEMBER_KEY = 'midc_remember_id'

function readRemembered() {
  try {
    return JSON.parse(localStorage.getItem(REMEMBER_KEY))
  } catch {
    return null
  }
}

export default function Login() {
  const { login, logout, loading, isAuthenticated, user } = useAuth()
  const { t, lang, languages, setLanguage } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()

  const [remembered] = useState(readRemembered)
  const [role, setRole] = useState(remembered?.role || ROLES.CITIZEN)
  const [loginId, setLoginId] = useState(remembered?.loginId || '')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(!!remembered)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  const isCitizenTab = role === ROLES.CITIZEN
  const isBusy = submitting || loading

  if (isAuthenticated && user && !submitting) {
    return <Navigate to={`/${user.role}`} replace />
  }

  const switchRole = (newRole) => {
    setRole(newRole)
    setError('')
    setInfo('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')

    if (!loginId.trim() || !password) {
      setError(t('loginPage.errRequired'))
      return
    }

    setSubmitting(true)

    try {
      const loggedUser = await login(loginId.trim(), password)

      if (loggedUser.role !== role) {
        await logout()
        setError(
          isCitizenTab
            ? t('loginPage.errNotCitizen')
            : t('loginPage.errNotAdmin')
        )
        setSubmitting(false)
        return
      }

      try {
        if (rememberMe) {
          localStorage.setItem(
            REMEMBER_KEY,
            JSON.stringify({ loginId: loginId.trim(), role })
          )
        } else {
          localStorage.removeItem(REMEMBER_KEY)
        }
      } catch {
        // Ignore storage errors
      }

      const fromState = location.state?.from
      const from =
        typeof fromState === 'string' ? fromState : fromState?.pathname

      const home = `/${loggedUser.role}`

      navigate(from && from.startsWith(home) ? from : home, { replace: true })
    } catch {
      setError(t('loginPage.errInvalid'))
      setSubmitting(false)
    }
  }

  const features = [
    { icon: Megaphone, label: t('loginPage.featureRegister') },
    { icon: RouteIcon, label: t('loginPage.featureTrack') },
    { icon: ShieldCheck, label: t('loginPage.featureTransparent') },
  ]

  const inputBase =
    'h-[46px] w-full rounded-2xl border border-[#e4d3c7] bg-white text-sm text-[#29221e] shadow-[0_1px_2px_rgba(100,55,30,0.04)] outline-none transition placeholder:text-[#8f847b] focus:border-[#bd593d] focus:ring-4 focus:ring-[#f9e7dc]'

  const iconBox =
    'pointer-events-none absolute left-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg border border-[#d9c5b8] bg-[#fffaf6] text-[#7a3a26]'

  return (
    <div className="relative min-h-dvh w-full overflow-x-hidden bg-gradient-to-br from-[#fffaf6] via-[#fff7f0] to-[#f9e9dc] lg:h-dvh lg:overflow-hidden">
      {/* ===== BACKGROUND GLOW ===== */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_20%_30%,rgba(255,255,255,0.9),transparent_55%),radial-gradient(ellipse_at_90%_90%,rgba(246,222,203,0.7),transparent_50%)]" />

      {/* ===== INDUSTRIAL PHOTO - BOTTOM LEFT ===== */}
      <div className="pointer-events-none absolute bottom-0 left-0 z-0 hidden h-[66%] w-[100%] lg:block">
        {/* mask fades the photo into the page on the top and right edges (no seam) */}
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
            clipPath="url(#midc-industrial-clip)"
          />
        </svg>

        {/* soft white wave over the bottom of the photo */}
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

      {/* ===== MAIN ===== */}
      <main className="relative z-10 grid grid-cols-1 gap-8 px-5 pb-8 pt-7 sm:px-8 lg:h-[calc(100dvh-104px)] lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_600px] lg:items-center lg:gap-10 lg:overflow-hidden lg:px-14 lg:pb-3 lg:pt-0">
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

        
        {/* ===== RIGHT: LOGIN CARD ===== */}
        <section className="relative z-10 flex w-full items-center justify-center">
          <div className="w-full max-w-[460px] rounded-[28px] border border-white/80 bg-white/85 p-6 shadow-raised backdrop-blur-xl sm:p-8">
            {/* Header */}
            
{/* Header */}

<div className="flex items-center gap-4">

  {/* MIDC LOGO */}

  <div className="flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-2xl border border-[#f0dfd5] bg-white shadow-sm">

    <img
      src="/logo.png"
      alt="MIDC Official Logo"
      className="h-[58px] w-[58px] object-contain"
    />

  </div>

  {/* HEADING */}

  <div className="min-w-0">

    <h2 className="font-display text-xl font-bold leading-tight tracking-tight text-ink-900 sm:text-[23px]">
      {t('loginPage.signInTitle')}
    </h2>

    <p className="mt-1 text-sm leading-snug text-ink-500">
      {t('loginPage.signInSubtitle')}
    </p>

  </div>

</div>


            {/* Citizen / Admin tabs (segmented) */}
            <div className="mt-6 grid grid-cols-2 gap-1 rounded-2xl bg-cream-200/80 p-1">
              {[
                { value: ROLES.CITIZEN, icon: User, label: t('loginPage.citizenTab') },
                { value: ROLES.ADMIN, icon: Users, label: t('loginPage.adminTab') },
              ].map(({ value, icon: Icon, label }) => {
                const active = role === value
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => switchRole(value)}
                    className={`flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl font-display text-sm font-semibold transition-all duration-200 sm:text-[15px] ${
                      active
                        ? 'bg-gradient-to-b from-brand-500 to-brand-700 text-white shadow-brand'
                        : 'text-ink-500 hover:bg-white/70 hover:text-brand-700'
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.9} />
                    {label}
                  </button>
                )
              })}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
              {/* User ID */}
              <div className="relative">
                <input
                  type="text"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder={
                    isCitizenTab ? t('loginPage.loginIdPlaceholder') : t('loginPage.adminIdPlaceholder')
                  }
                  autoComplete="username"
                  className="peer h-12 w-full rounded-xl border border-cream-300 bg-white pl-12 pr-4 text-[15px] text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                />
                {isCitizenTab ? (
                  <Smartphone className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400 transition peer-focus:text-brand-600" />
                ) : (
                  <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400 transition peer-focus:text-brand-600" />
                )}
              </div>

              {/* Password */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('loginPage.passwordPlaceholder')}
                  autoComplete="current-password"
                  className="peer h-12 w-full rounded-xl border border-cream-300 bg-white pl-12 pr-12 text-[15px] text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                />
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400 transition peer-focus:text-brand-600" />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? t('loginPage.hidePassword') : t('loginPage.showPassword')}
                  className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-ink-400 transition hover:bg-cream-100 hover:text-ink-900"
                >
                  {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                </button>
              </div>

              

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Info */}
              {info && (
                <div className="flex items-start gap-2 rounded-xl border border-brand-200 bg-brand-50 px-3.5 py-2.5 text-sm text-brand-800">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{info}</span>
                </div>
              )}

              {/* Login button */}
              <button
                type="submit"
                disabled={isBusy}
                className="flex h-12 w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-gradient-to-b from-brand-500 to-brand-700 font-display text-base font-semibold text-white shadow-brand transition-all duration-200 hover:-translate-y-0.5 hover:from-brand-600 hover:to-brand-800 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isBusy ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {t('loginPage.loggingIn')}
                  </>
                ) : (
                  <>
                    {t('loginPage.loginButton')}
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 border-t border-cream-200 pt-5">
              {isCitizenTab ? (
                <p className="text-center text-sm text-ink-500">
                  {t('loginPage.newUser')}{' '}
                  <Link
                    to="/register"
                    className="ml-1 inline-flex items-center gap-1 font-display font-semibold text-brand-600 transition hover:text-brand-800"
                  >
                    {t('loginPage.registerNow')}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </p>
              ) : (
                <p className="text-center text-sm text-ink-500">{t('loginPage.adminNote')}</p>
              )}
            </div>
          </div>
        </section>


      </main>
    </div>
  )
}







