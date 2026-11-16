import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Search,
  Filter,
  Plus,
  ArrowRight,
  Eye,
  Calendar,
  Building2,
  AlertCircle,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { api } from '../../services/api'
import StatusBadge from '../../components/common/StatusBadge'
import PriorityBadge from '../../components/common/PriorityBadge'
import DataTable from '../../components/common/DataTable'

export default function MyGrievances() {
  const { user } = useAuth()
  const { t, lang } = useLanguage()
  const navigate = useNavigate()

  const [grievances, setGrievances] = useState([])
  const [categories, setCategories] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    async function fetchGrievances() {
      try {
        setLoading(true)
        const [list, cats, depts] = await Promise.all([
          api.getGrievances({ citizenId: user?.id || 'USR-C001' }),
          api.getCategories(),
          api.getDepartments(),
        ])
        setGrievances(list)
        setCategories(cats)
        setDepartments(depts)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchGrievances()
  }, [user?.id])

  const getDeptName = (row) => {
    const cat = categories.find((c) => c.id === row.categoryId)
    const primaryDeptId = row.departmentIds?.[0] || cat?.departments?.[0]
    const dept = departments.find((d) => d.id === primaryDeptId)
    if (dept) {
      return lang === 'mr' && dept.nameMr ? dept.nameMr : dept.name
    }
    return 'Engineering'
  }

  // Filtered grievances
  const filtered = grievances.filter((g) => {
    const matchesSearch =
      !search ||
      g.id.toLowerCase().includes(search.toLowerCase()) ||
      g.title.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || g.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const columns = [
    {
      header: t('table.grievanceId'),
      accessor: 'id',
      render: (row) => (
        <span className="font-semibold text-brand-700 font-mono tracking-tight">
          {row.id}
        </span>
      ),
    },
    {
      header: t('table.complaint'),
      accessor: 'title',
      render: (row) => (
        <div>
          <span className="font-medium text-ink-900 block">{row.title}</span>
          <span className="text-[11px] text-ink-400 block truncate max-w-sm">
            {row.location?.address}
          </span>
        </div>
      ),
    },
    {
      header: t('table.department'),
      accessor: 'dept',
      render: (row) => <span className="text-xs text-ink-700">{getDeptName(row)}</span>,
    },
    {
      header: t('common.priority'),
      accessor: 'priority',
      render: (row) => <PriorityBadge priority={row.priority} />,
    },
    {
      header: t('table.submittedDate'),
      accessor: 'createdAt',
      render: (row) => (
        <span className="text-xs text-ink-600">
          {row.createdAt
            ? new Date(row.createdAt).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })
            : '—'}
        </span>
      ),
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
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-900 border border-brand-200 hover:border-brand-300 rounded-lg px-2.5 py-1 bg-white transition shadow-2xs cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{t('dashboard.viewDetails')}</span>
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl lg:text-3xl text-ink-900 tracking-tight">
            {t('nav.myGrievances')}
          </h1>
          <p className="text-xs sm:text-sm text-ink-500 mt-1">
            Track and monitor all your lodged grievances and resolutions.
          </p>
        </div>

        <Link
          to="/citizen/register"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium text-xs sm:text-sm shadow-brand transition cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t('dashboard.btnRegister')}</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-cream-200/90 shadow-card flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-ink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID or description..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-cream-300 bg-cream-50/50 text-xs text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-ink-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-cream-300 bg-white text-xs font-medium text-ink-700 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="received">{t('status.received')}</option>
            <option value="assigned">{t('status.assigned')}</option>
            <option value="work_started">{t('status.work_started')}</option>
            <option value="in_progress">{t('status.in_progress')}</option>
            <option value="resolved">{t('status.resolved')}</option>
            <option value="closed">{t('status.closed')}</option>
          </select>
        </div>
      </div>

      {/* Grievances Table */}
      <div className="bg-white rounded-3xl p-6 border border-cream-200/90 shadow-card">
        <DataTable
          columns={columns}
          data={filtered}
          keyField="id"
          emptyMessage={loading ? 'Loading complaints...' : 'No grievances found.'}
        />
      </div>
    </div>
  )
}
