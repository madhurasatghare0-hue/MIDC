import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Sparkles,
  Info,
  Type,
  Camera,
  Mic,
  ArrowRight,
  Plus,
  Compass,
  Megaphone,
  Bot,
  ClipboardList,
  MessageSquareText,
  Pencil,
  FileText,
  Construction,
  Zap,
  Droplets,
  Waves,
  Trash2,
  Leaf,
  Flame,
  Landmark,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { api } from '../../services/api'
import MiniTracker from '../../components/common/MiniTracker'
import StatusBadge from '../../components/common/StatusBadge'
import DataTable from '../../components/common/DataTable'
import VoiceRecorder from '../../components/common/VoiceRecorder'

// Department icon names (from mockMaster) → lucide components
const DEPT_ICONS = { Construction, Zap, Droplets, Waves, Trash2, Leaf, Flame, Landmark }

// Workflow order used by the tracker
const STEP_ORDER = ['received', 'assigned', 'work_started', 'in_progress', 'resolved']
const ACTIVE_STATUSES = ['received', 'assigned', 'work_started', 'in_progress', 'action_not_taken']

const lastActivityAt = (g) => {
  const last = g.timeline?.[g.timeline.length - 1]
  return new Date(last?.at || g.createdAt).getTime()
}

export default function CitizenDashboard() {
  const { user } = useAuth()
  const { t, lang } = useLanguage()
  const navigate = useNavigate()
  const locale = lang === 'mr' ? 'mr-IN' : 'en-GB'

  // Intake
  const [intakeMode, setIntakeMode] = useState('type') // 'type' | 'voice' | 'photo'
  const [complaintText, setComplaintText] = useState('')

  // Data
  const [loading, setLoading] = useState(true)
  const [grievances, setGrievances] = useState([])
  const [categories, setCategories] = useState([])
  const [departments, setDepartments] = useState([])

  useEffect(() => {
    if (!user?.id) return
    let cancelled = false

    async function loadData() {
      try {
        setLoading(true)
        const [userGrievances, catList, deptList] = await Promise.all([
          api.getGrievances({ citizenId: user.id }),
          api.getCategories(),
          api.getDepartments(),
        ])
        if (cancelled) return
        // Safety net: only this citizen's complaints, newest first
        const mine = userGrievances
          .filter((g) => g.citizenId === user.id)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setGrievances(mine)
        setCategories(catList)
        setDepartments(deptList)
      } catch (err) {
        console.error('Error loading dashboard data:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadData()
    return () => {
      cancelled = true
    }
  }, [user?.id])

  const handleContinueAI = (e) => {
    e.preventDefault()
    navigate('/citizen/register', {
      state: { initialMode: intakeMode, initialText: complaintText },
    })
  }

  // ---------- Helpers ----------
  const formatDate = (iso, withYear = false) => {
    if (!iso) return ''
    return new Date(iso).toLocaleDateString(locale, {
      day: '2-digit',
      month: 'short',
      ...(withYear && { year: 'numeric' }),
    })
  }

  const formatDateTime = (iso) => {
    if (!iso) return ''
    return new Date(iso).toLocaleString(locale, {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getPrimaryDept = (row) => {
    const cat = categories.find((c) => c.id === row.categoryId)
    const deptId = row.departmentIds?.[0] || cat?.departments?.[0]
    return departments.find((d) => d.id === deptId)
  }

  const getDeptName = (row) => {
    const dept = getPrimaryDept(row)
    if (!dept) return '—'
    return lang === 'mr' && dept.nameMr ? dept.nameMr : dept.name
  }

  // ---------- Active complaint (most recent activity among open ones) ----------
  const activeComplaint =
    [...grievances]
      .filter((g) => ACTIVE_STATUSES.includes(g.status))
      .sort((a, b) => lastActivityAt(b) - lastActivityAt(a))[0] || grievances[0]

  const latestStep = activeComplaint?.timeline?.[activeComplaint.timeline.length - 1]
  const isNewUpdate = latestStep && Date.now() - new Date(latestStep.at).getTime() < 24 * 60 * 60 * 1000
  const ActiveIcon = DEPT_ICONS[activeComplaint && getPrimaryDept(activeComplaint)?.icon] || FileText

  // ---------- Tracker steps ----------
  const getTrackerSteps = () => {
    const labels = [
      t('status.received'),
      t('status.assigned'),
      t('status.work_started'),
      t('status.in_progress'),
      `${t('status.resolved')} / ${t('status.closed')}`,
    ]

    if (!activeComplaint) {
      return labels.map((label) => ({ label, date: '', state: 'upcoming' }))
    }

    const { status, timeline = [] } = activeComplaint
    const stepAt = (s) => timeline.find((item) => item.status === s)?.at

    // closed counts as the final step; action_not_taken stays at "assigned"
    let curIndex = STEP_ORDER.indexOf(status)
    if (status === 'closed') curIndex = 4
    if (status === 'action_not_taken') curIndex = 1
    const isDone = status === 'resolved' || status === 'closed'

    return STEP_ORDER.map((s, i) => ({
      label: labels[i],
      date: formatDate(i === 4 ? stepAt('resolved') || stepAt('closed') : stepAt(s)),
      state: i < curIndex || (i === curIndex && isDone) ? 'completed' : i === curIndex ? 'active' : 'upcoming',
    }))
  }

  // ---------- Table ----------
  const recentGrievances = grievances.slice(0, 5)

  const tableColumns = [
    {
      header: t('table.grievanceId'),
      accessor: 'id',
      render: (row) => (
        <span className="whitespace-nowrap font-mono font-semibold tracking-tight text-brand-700">
          {row.id}
        </span>
      ),
    },
    {
      header: t('table.complaint'),
      accessor: 'title',
      render: (row) => (
        <span className="block max-w-xs truncate font-medium text-ink-900">{row.title}</span>
      ),
    },
    {
      header: t('table.submittedDate'),
      accessor: 'createdAt',
      render: (row) => (
        <span className="whitespace-nowrap text-xs text-ink-500">{formatDate(row.createdAt, true) || '—'}</span>
      ),
    },
    {
      header: t('table.department'),
      accessor: 'department',
      render: (row) => <span className="text-ink-700">{getDeptName(row)}</span>,
    },
    {
      header: t('table.status'),
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} label={t(`status.${row.status}`)} />,
    },
    {
      header: t('table.action'),
      align: 'right',
      render: (row) => (
        <button
          onClick={() => navigate(`/citizen/grievances/${row.id}`)}
          className="inline-flex cursor-pointer items-center gap-1 whitespace-nowrap rounded-lg border border-brand-200/90 bg-white px-2.5 py-1 text-xs font-semibold text-brand-700 shadow-2xs transition hover:border-brand-300 hover:text-brand-900"
        >
          <span>{t('dashboard.viewDetails')}</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* ================= 1. HERO BANNER ================= */}
      <div className="relative min-h-[220px] overflow-hidden rounded-3xl border border-cream-200/90 bg-cream-100 shadow-card">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/login-bg.jpg"
            alt="MIDC Industrial Complex"
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 w-full bg-gradient-to-r from-cream-100/95 via-cream-100/80 to-transparent md:w-3/5" />
          <div className="absolute inset-0 bg-gradient-to-t from-cream-100/60 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-2xl p-6 md:p-8">
          <div className="mb-2 inline-flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600">
              {t('dashboard.citizenServices')}
            </span>
            <span className="h-[2px] w-8 rounded-full bg-brand-300" />
          </div>

          <h2 className="mb-2 font-display text-2xl font-extrabold leading-tight tracking-tight text-ink-900 md:text-3xl">
            {t('dashboard.heroTitle')}
          </h2>

          <p className="mb-5 text-sm leading-relaxed text-ink-700">{t('dashboard.heroSubtitle')}</p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/citizen/register"
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-medium text-white shadow-brand transition hover:bg-brand-700"
            >
              <Plus className="h-4 w-4" />
              <span>{t('dashboard.btnRegister')}</span>
            </Link>

            <Link
              to="/citizen/track"
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-cream-300 bg-white/95 px-5 py-2.5 text-sm font-medium text-ink-700 shadow-xs backdrop-blur-xs transition hover:bg-white hover:text-ink-900"
            >
              <Compass className="h-4 w-4 text-ink-500" />
              <span>{t('dashboard.btnTrack')}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ================= 2. REGISTER (left) + UPDATES (right) ================= */}
      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
        {/* Register Your Complaint */}
        <div className="flex h-full flex-col rounded-3xl border border-cream-200/90 bg-white p-6 shadow-card lg:col-span-7">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50">
                <FileText className="h-5 w-5 text-brand-600" />
              </div>
              <h3 className="truncate font-display text-lg font-bold text-ink-900 md:text-xl">
                {t('dashboard.registerCardTitle')}
              </h3>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-amber-200/80 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 shadow-2xs">
                <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                <span>{t('dashboard.aiAssistanceBadge')}</span>
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <div
                title="AI Grievance Assistant"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-200/70 bg-gradient-to-tr from-brand-50 to-amber-50 shadow-2xs"
              >
                <Bot className="h-5 w-5 text-brand-600" />
              </div>
              <button className="cursor-pointer p-1 text-ink-400 hover:text-ink-700">
                <Info className="h-4 w-4" />
              </button>
            </div>
          </div>

          <p className="mb-4 text-xs text-ink-500 md:text-sm">{t('dashboard.registerCardSubtitle')}</p>

          {/* Intake modes */}
          <div className="mb-5 grid grid-cols-3 gap-3">
            {[
              { mode: 'type', icon: Type, title: t('dashboard.modeType'), desc: t('dashboard.modeTypeDesc') },
              { mode: 'voice', icon: Mic, title: t('voice.speak'), desc: t('voice.speakDesc') },
              { mode: 'photo', icon: Camera, title: t('dashboard.modePhoto'), desc: t('dashboard.modePhotoDesc') },
            ].map(({ mode, icon: Icon, title, desc }) => {
              const active = intakeMode === mode
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setIntakeMode(mode)}
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border p-4 text-center transition ${
                    active
                      ? 'border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/10'
                      : 'border-cream-200 hover:bg-cream-50/80'
                  }`}
                >
                  <div
                    className={`mb-2 flex h-10 w-10 items-center justify-center rounded-xl ${
                      active ? 'bg-brand-600 text-white' : 'bg-cream-100 text-ink-500'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="block font-display text-sm font-bold text-ink-900">{title}</span>
                  <span className="mt-0.5 hidden text-[11px] leading-tight text-ink-500 sm:block">{desc}</span>
                </button>
              )
            })}
          </div>

          {/* Input + Continue (pinned to bottom) */}
          <form onSubmit={handleContinueAI} className="mt-auto">
            {intakeMode === 'voice' ? (
              <div className="space-y-3">
                <VoiceRecorder value={complaintText} onChange={setComplaintText} rows={2} />
                <button
                  type="submit"
                  disabled={!complaintText.trim()}
                  className="inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-medium text-white shadow-brand transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{t('dashboard.btnContinueAI')}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ) : (
            <div className="flex flex-col items-stretch gap-2.5 sm:flex-row">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={complaintText}
                  onChange={(e) => setComplaintText(e.target.value)}
                  placeholder={t('dashboard.inputPlaceholder')}
                  className="peer h-12 w-full rounded-xl border border-cream-300 bg-cream-50/40 pl-11 pr-4 text-sm text-ink-900 shadow-inner transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
                <Pencil className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 transition peer-focus:text-brand-600" />
              </div>

              <button
                type="submit"
                className="inline-flex h-12 shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-brand-600 px-5 text-sm font-medium text-white shadow-brand transition hover:bg-brand-700"
              >
                <Sparkles className="h-4 w-4" />
                <span>{t('dashboard.btnContinueAI')}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            )}
          </form>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-5 lg:col-span-5">
          {/* Latest Complaint Update */}
          <div className="rounded-3xl border border-cream-200/90 bg-white p-5 shadow-card">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-brand-600" />
                <h4 className="font-display text-sm font-bold text-ink-900">{t('dashboard.latestUpdateTitle')}</h4>
              </div>
              {isNewUpdate && (
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                  {t('dashboard.newUpdateBadge')}
                </span>
              )}
            </div>

            {loading ? (
              <div className="h-[118px] animate-pulse rounded-2xl bg-cream-100" />
            ) : activeComplaint ? (
              <>
                <div className="mb-3 rounded-2xl border border-amber-200/60 bg-amber-50/70 p-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
                      <ActiveIcon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-xs font-semibold text-ink-900">
                        <span className="font-mono text-brand-700">{activeComplaint.id}</span> · {activeComplaint.title}
                      </div>
                      <div className="text-[11px] text-ink-500">{formatDateTime(latestStep?.at || activeComplaint.createdAt)}</div>
                    </div>
                  </div>

                  <div className="mt-3 border-t border-amber-200/50 pt-2.5 text-xs">
                    <p className="mb-0.5 font-semibold text-ink-900">
                      {latestStep?.note || t(`status.${latestStep?.status || activeComplaint.status}`)}
                    </p>
                    {latestStep?.by && (
                      <p className="text-[11px] leading-relaxed text-ink-500">
                        {t('dashboard.updatedBy', 'Updated by')}: {latestStep.by}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <div className="text-ink-500">
                    <span>{t('dashboard.currentStage')}: </span>
                    <span className="font-semibold text-brand-700">{t(`status.${activeComplaint.status}`)}</span>
                  </div>
                  <Link
                    to={`/citizen/grievances/${activeComplaint.id}`}
                    className="flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-900"
                  >
                    <span>{t('dashboard.viewDetails')}</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </>
            ) : (
              <div className="py-6 text-center text-xs text-ink-400">
                {t('dashboard.noActive', 'No active complaints currently.')}
              </div>
            )}
          </div>

          {/* Track Your Complaint */}
          <div className="flex-1 rounded-3xl border border-cream-200/90 bg-white p-5 shadow-card">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-brand-600" />
                <h4 className="font-display text-sm font-bold text-ink-900">{t('dashboard.trackComplaintTitle')}</h4>
              </div>
              {activeComplaint && (
                <span className="font-mono text-[11px] font-semibold text-brand-700">{activeComplaint.id}</span>
              )}
            </div>

            <MiniTracker steps={getTrackerSteps()} />
          </div>
        </div>
      </div>

      {/* ================= 3. RECENT GRIEVANCES + NEED HELP (one row) ================= */}
      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
        {/* My Recent Grievances */}
        <div className="rounded-3xl border border-cream-200/90 bg-white p-6 shadow-card lg:col-span-8">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50">
                <ClipboardList className="h-5 w-5 text-brand-600" />
              </div>
              <h3 className="font-display text-lg font-bold text-ink-900">{t('dashboard.recentGrievancesTitle')}</h3>
            </div>
            <Link
              to="/citizen/grievances"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 transition hover:text-brand-900"
            >
              <span>{t('dashboard.viewAllGrievances')}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <DataTable
              columns={tableColumns}
              data={recentGrievances}
              keyField="id"
              emptyMessage={
                loading
                  ? t('dashboard.loading', 'Loading grievances...')
                  : t('dashboard.noGrievances', 'No grievances registered yet.')
              }
            />
          </div>
        </div>

        {/* Need Help – vertical AI card */}
        <div className="relative flex flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 p-6 text-white shadow-card lg:col-span-4">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-sky-400/15 blur-3xl" />

          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
            <Bot className="h-8 w-8 text-sky-400" />
          </div>

          <h4 className="relative mt-4 font-display text-lg font-bold leading-snug text-white">
            {t('dashboard.needHelpTitle')}
          </h4>
          <p className="relative mt-2 text-sm leading-relaxed text-slate-300">{t('dashboard.needHelpDesc')}</p>

          <div className="relative mt-5 flex flex-wrap gap-2">
            {[
              { icon: MessageSquareText, label: t('dashboard.modeType') },
              { icon: Mic, label: t('voice.speak') },
              { icon: Camera, label: t('dashboard.modePhoto') },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-slate-200"
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </span>
            ))}
          </div>

          <Link to="/citizen/register" className="relative mt-auto pt-6">
            <span className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-300 to-gold-400 font-display text-sm font-bold text-ink-900 shadow-sm transition hover:brightness-105">
              {t('dashboard.tryAIAssistance')}
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}