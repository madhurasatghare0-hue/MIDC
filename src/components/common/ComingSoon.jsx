import { LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function ComingSoon({ title }) {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-cream-100 p-8">
      <div className="mx-auto max-w-4xl rounded-card border border-cream-300/60 bg-white p-6 shadow-card">
        <div className="flex items-center justify-between border-b border-cream-200 pb-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink-900">{title}</h1>
            <p className="text-sm text-ink-500">Logged in as: {user?.name}</p>
          </div>
          <button
            onClick={logout}
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
        <p className="mt-6 text-ink-700">This page is under construction.</p>
      </div>
    </div>
  )
}