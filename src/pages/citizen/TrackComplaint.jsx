import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Search, Compass, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { api } from '../../services/api'
import MiniTracker from '../../components/common/MiniTracker'
import StatusBadge from '../../components/common/StatusBadge'

export default function TrackComplaint() {
  const { t } = useLanguage()
  const navigate = useNavigate()

  const [queryId, setQueryId] = useState('')
  const [searching, setSearching] = useState(false)
  const [result, setResult] = useState(null)
  const [notFound, setNotFound] = useState(false)

  const handleTrack = async (e) => {
    e.preventDefault()
    if (!queryId.trim()) return

    setSearching(true)
    setNotFound(false)
    setResult(null)

    try {
      const ticket = await api.getGrievanceById(queryId.trim().toUpperCase())
      if (ticket) {
        setResult(ticket)
      } else {
        setNotFound(true)
      }
    } catch {
      setNotFound(true)
    } finally {
      setSearching(false)
    }
  }

  // Generate dynamic steps if ticket found
  const getSteps = () => {
    if (!result) return []
    const stepOrder = ['received', 'assigned', 'work_started', 'in_progress', 'resolved']
    const curIndex = stepOrder.indexOf(result.status)

    return [
      {
        label: t('status.received'),
        date: result.createdAt?.split('T')[0] || '',
        state: curIndex >= 0 ? (curIndex === 0 ? 'active' : 'completed') : 'completed',
      },
      {
        label: t('status.assigned'),
        date: result.timeline?.find((x) => x.status === 'assigned')?.at?.split('T')[0] || '',
        state: curIndex >= 1 ? (curIndex === 1 ? 'active' : 'completed') : 'upcoming',
      },
      {
        label: t('status.work_started'),
        date: result.timeline?.find((x) => x.status === 'work_started')?.at?.split('T')[0] || '',
        state: curIndex >= 2 ? (curIndex === 2 ? 'active' : 'completed') : 'upcoming',
      },
      {
        label: t('status.in_progress'),
        date: result.timeline?.find((x) => x.status === 'in_progress')?.at?.split('T')[0] || '',
        state: curIndex >= 3 ? (curIndex === 3 ? 'active' : 'completed') : 'upcoming',
      },
      {
        label: `${t('status.resolved')} / ${t('status.closed')}`,
        date: result.resolvedAt?.split('T')[0] || '',
        state: result.status === 'resolved' || result.status === 'closed' ? 'completed' : 'upcoming',
      },
    ]
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center mx-auto">
          <Compass className="w-6 h-6" />
        </div>
        <h1 className="font-display font-bold text-2xl lg:text-3xl text-ink-900 tracking-tight">
          Track Your Grievance
        </h1>
        <p className="text-xs sm:text-sm text-ink-500">
          Enter your MIDC complaint ticket ID to view real-time status and officer updates.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleTrack} className="flex gap-2">
        <input
          type="text"
          value={queryId}
          onChange={(e) => setQueryId(e.target.value)}
          placeholder="e.g. MIDC-1024"
          className="flex-1 px-4 py-3 rounded-2xl border border-cream-300 bg-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/20 uppercase"
        />
        <button
          type="submit"
          disabled={searching}
          className="px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs sm:text-sm shadow-brand transition cursor-pointer"
        >
          {searching ? 'Tracking...' : 'Track Ticket'}
        </button>
      </form>

      {/* Not found state */}
      {notFound && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>No grievance found with ID "{queryId}". Please verify the ticket ID.</span>
        </div>
      )}

      {/* Result Card */}
      {result && (
        <div className="bg-white rounded-3xl p-6 border border-cream-200/90 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-brand-700">{result.id}</span>
            <StatusBadge status={result.status} label={t(`status.${result.status}`)} />
          </div>

          <h3 className="font-display font-bold text-lg text-ink-900">{result.title}</h3>
          <p className="text-xs text-ink-500">{result.description}</p>

          <div className="p-3 bg-cream-50 rounded-xl border border-cream-200">
            <MiniTracker steps={getSteps()} />
          </div>

          <div className="pt-2 flex justify-end">
            <Link
              to={`/citizen/grievances/${result.id}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-brand-900"
            >
              <span>View Full History & Officer Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
