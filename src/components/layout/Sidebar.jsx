import { NavLink } from 'react-router-dom'
import {
  Home,
  PlusCircle,
  FileText,
  Bell,
  User,
  HelpCircle,
  LogOut,
  FolderKanban,
  UserCheck,
  BarChart3,
  TrendingUp,
  Database,
  UsersRound,
  Settings,
  ChevronDown,
  X,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { ROLES } from '../../utils/constants'

export default function Sidebar({ mobileOpen = false, setMobileOpen = () => {} }) {
  const { user, logout } = useAuth()
  const { t } = useLanguage()

  const isAdmin = user?.role === ROLES.ADMIN

  const citizenNav = [
    { to: '/citizen', label: t('nav.dashboard'), icon: Home, end: true },
    { to: '/citizen/register', label: t('nav.registerGrievance'), icon: PlusCircle },
    { to: '/citizen/grievances', label: t('nav.myGrievances'), icon: FileText },
    { to: '/citizen/notifications', label: t('nav.notifications'), icon: Bell, badge: true },
    { to: '/citizen/profile', label: t('nav.profile'), icon: User },
    { to: '/citizen/help', label: t('nav.helpSupport'), icon: HelpCircle },
  ]

  const adminNav = [
    { to: '/admin', label: t('nav.adminDashboard'), icon: Home, end: true },
    { to: '/admin/grievances', label: t('nav.grievanceManagement'), icon: FolderKanban, hasSub: true },
    { to: '/admin/assignments', label: t('nav.assignments'), icon: UserCheck },
    { to: '/admin/departments', label: t('nav.departmentPerformance'), icon: BarChart3 },
    { to: '/admin/reports', label: t('nav.reportsAnalytics'), icon: TrendingUp, hasSub: true },
    { to: '/admin/master-data', label: t('nav.masterData'), icon: Database },
    { to: '/admin/users', label: t('nav.userManagement'), icon: UsersRound },
    { to: '/admin/notifications', label: t('nav.notifications'), icon: Bell, badge: true },
    { to: '/admin/settings', label: t('nav.systemSettings'), icon: Settings },
  ]

  const navItems = isAdmin ? adminNav : citizenNav

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-ink-950/40 backdrop-blur-xs transition-opacity lg:hidden"
        />
      )}

      <aside
        className={`fixed bottom-4 left-4 top-4 z-50 flex w-64 select-none flex-col overflow-hidden rounded-3xl border border-cream-300/70 bg-white/95 shadow-raised backdrop-blur-xl transition-transform duration-300 ease-in-out lg:z-40 lg:flex lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-[110%] lg:translate-x-0'
        }`}
      >
        {/* ===== Brand ===== */}
        <div className="flex shrink-0 items-center justify-between border-b border-cream-200/80 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-cream-300 bg-white shadow-card">
              <img src="/logo.png" alt="MIDC Logo" className="h-full w-full object-contain p-1" />
            </div>
            <div className="min-w-0">
              <div className="font-display text-lg font-bold leading-tight tracking-tight text-brand-700">
                MIDC
              </div>
              <div className="text-[10px] leading-tight text-ink-500">
                Maharashtra Industrial
                <br />
                Development Corporation
              </div>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-cream-100 hover:text-ink-700 lg:hidden cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ===== Navigation ===== */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-xl px-3.5 py-2.5 font-display text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-b from-brand-500 to-brand-700 text-white shadow-brand'
                      : 'text-ink-700 hover:bg-cream-100 hover:text-brand-700'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex min-w-0 items-center gap-3">
                      <Icon
                        className={`h-5 w-5 shrink-0 ${isActive ? 'text-white' : 'text-ink-500'}`}
                        strokeWidth={1.8}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-status-overdue ring-2 ring-white" />
                    )}
                    {item.hasSub && (
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 opacity-70 ${isActive ? 'text-white' : 'text-ink-400'}`}
                      />
                    )}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* ===== Logout ===== */}
        <div className="relative shrink-0 overflow-hidden border-t border-cream-200/80 px-3 pb-4 pt-4">
          <button
            onClick={logout}
            className="relative z-10 flex w-full cursor-pointer items-center gap-3 rounded-xl px-3.5 py-2.5 font-display text-sm font-medium text-ink-700 transition hover:bg-brand-50 hover:text-brand-700"
          >
            <LogOut className="h-5 w-5 shrink-0 text-ink-500" strokeWidth={1.8} />
            <span>{t('nav.logout')}</span>
          </button>
        </div>
      </aside>
    </>
  )
}