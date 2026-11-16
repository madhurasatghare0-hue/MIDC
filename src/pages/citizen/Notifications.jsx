import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bell, CheckCheck, Clock, ExternalLink } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { api } from '../../services/api'

export default function Notifications() {
  const { user } = useAuth()
  const { t } = useLanguage()

  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadNotifs() {
      try {
        setLoading(true)
        const list = await api.getNotifications(user?.id || 'USR-C001')
        setNotifications(list)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    loadNotifs()
  }, [user?.id])

  const handleMarkAllRead = async () => {
    await api.markAllNotificationsAsRead(user?.id || 'USR-C001')
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const handleMarkOne = async (id) => {
    await api.markNotificationAsRead(id)
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink-900 tracking-tight">
            {t('nav.notifications')}
          </h1>
          <p className="text-xs text-ink-500 mt-1">
            Real-time updates regarding your lodged complaints and department activities.
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-brand-900 px-3 py-1.5 bg-cream-100 hover:bg-cream-200 rounded-xl transition cursor-pointer"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          <span>Mark all as read</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-cream-200/90 shadow-card divide-y divide-cream-100">
        {loading ? (
          <div className="py-8 text-center text-xs text-ink-400">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="py-8 text-center text-xs text-ink-400">No notifications found.</div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleMarkOne(notif.id)}
              className={`py-4 px-3 rounded-2xl flex items-start justify-between gap-4 transition cursor-pointer ${
                notif.read ? 'opacity-70 hover:bg-cream-50/50' : 'bg-brand-50/40 hover:bg-brand-50/70'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    notif.read ? 'bg-cream-200 text-ink-500' : 'bg-brand-600 text-white'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-ink-900">{notif.title}</h4>
                  <p className="text-xs text-ink-600 mt-0.5">{notif.message}</p>
                  <span className="text-[10px] text-ink-400 mt-1 block">
                    {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString('en-GB') : ''}
                  </span>
                </div>
              </div>

              {notif.grievanceId && (
                <Link
                  to={`/citizen/grievances/${notif.grievanceId}`}
                  className="text-xs font-semibold text-brand-700 hover:underline shrink-0 flex items-center gap-1"
                >
                  <span>View</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
