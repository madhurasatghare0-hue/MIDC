import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Globe, ChevronDown, CalendarDays, User as UserIcon, Menu } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { api } from '../../services/api'
import { ROLES } from '../../utils/constants'

export default function Header({ onToggleMobile = () => {} }) {
  const { user } = useAuth()
  const { lang, setLanguage, t } = useLanguage()

  const [unreadCount, setUnreadCount] = useState(0)

  const isAdmin = user?.role === ROLES.ADMIN
  const base = isAdmin ? '/admin' : '/citizen'
  const displayName = lang === 'mr' && user?.nameMr ? user.nameMr : user?.name || 'User'

  useEffect(() => {
    async function fetchUnread() {
      try {
        const notifs = await api.getNotifications(isAdmin ? 'admin' : user?.id || 'USR-C001')
        const unread = notifs.filter((n) => !n.read).length
        setUnreadCount(unread)
      } catch (e) {
        console.error(e)
      }
    }
    fetchUnread()
  }, [isAdmin, user?.id])

  return (
    <header className="sticky top-4 z-30 mx-4 mt-4 flex h-16 items-center justify-between gap-4 rounded-full border border-cream-300/70 bg-white/85 pl-4 sm:pl-6 pr-2.5 shadow-raised backdrop-blur-xl lg:ml-2 lg:mr-6">
      {/* Left: Mobile hamburger + title + role pill */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={onToggleMobile}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-cream-300 bg-white text-ink-700 shadow-2xs hover:bg-cream-50 lg:hidden cursor-pointer shrink-0"
        >
          <Menu className="h-5 w-5 text-ink-600" />
        </button>

        <h1 className="truncate font-display text-sm font-semibold tracking-tight text-ink-900 sm:text-lg">
          MIDC Grievance Redressal Portal
        </h1>
        <span className="hidden shrink-0 items-center rounded-full border border-brand-200/80 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 sm:inline-flex">
          {isAdmin ? t('nav.adminDashboardPill') : t('nav.citizenDashboardPill')}
        </span>
      </div>

      {/* Right: actions */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {/* Fiscal year (admin only) */}
        {isAdmin && (
          <div className="hidden h-10 items-center gap-1.5 rounded-full border border-cream-300/80 bg-cream-50 px-4 text-xs font-medium text-ink-700 md:flex">
            <CalendarDays className="h-4 w-4 text-ink-500" />
            <span>FY 2025–26</span>
            <ChevronDown className="h-3.5 w-3.5 text-ink-400" />
          </div>
        )}

        {/* Language toggle */}
        <button
          onClick={() => setLanguage(lang === 'en' ? 'mr' : 'en')}
          title="Switch Language"
          className="flex h-10 cursor-pointer items-center gap-1.5 rounded-full border border-cream-300/80 bg-cream-50 px-4 text-xs font-medium text-ink-700 transition hover:bg-cream-100"
        >
          <Globe className="h-4 w-4 text-ink-500" />
          <span>{lang === 'en' ? 'English' : 'मराठी'}</span>
          <ChevronDown className="h-3.5 w-3.5 text-ink-400" />
        </button>

        {/* Notifications */}
        <Link
          to={`${base}/notifications`}
          title="Notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-cream-300/80 bg-cream-50 text-ink-700 transition hover:bg-cream-100"
        >
          <Bell className="h-[18px] w-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">
              {unreadCount}
            </span>
          )}
        </Link>

        {/* Profile capsule */}
        <Link
          to={isAdmin ? `${base}/settings` : `${base}/profile`}
          className="flex h-11 items-center gap-2.5 rounded-full bg-cream-100 py-1 pl-1 pr-4 transition hover:bg-brand-50"
        >
          <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-brand-200 bg-brand-100">
            {user?.avatar ? (
              <img src={user.avatar} alt={displayName} className="h-full w-full object-cover" />
            ) : (
              <UserIcon className="h-4 w-4 text-brand-600" />
            )}
          </span>
          <span className="hidden flex-col text-left md:flex">
            <span className="text-sm font-medium leading-tight text-ink-900">{displayName}</span>
            {user?.designation && (
              <span className="text-[11px] leading-tight text-ink-400">{user.designation}</span>
            )}
          </span>
        </Link>
      </div>
    </header>
  )
}
