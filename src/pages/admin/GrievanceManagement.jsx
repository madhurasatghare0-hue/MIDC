import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  UserCheck,
  Building2,
  AlertCircle,
  Eye,
  SlidersHorizontal,
} from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { api } from '../../services/api'
import StatusBadge from '../../components/common/StatusBadge'
import PriorityBadge from '../../components/common/PriorityBadge'
import DataTable from '../../components/common/DataTable'

export default function GrievanceManagement() {
  const { t, lang } = useLanguage()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [grievances, setGrievances] = useState([])
  const [departments, setDepartments] = useState([])
  const [officers, setOfficers] = useState([])
  const [divisions, setDivisions] = useState([])

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [deptFilter, setDeptFilter] = useState('all')
  const [clusterFilter, setClusterFilter] = useState(false)

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState([])

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [gList, dList, oList, divList] = await Promise.all([
          api.getGrievances(),
          api.getDepartments(),
          api.getOfficers(),
          api.getDivisions(),
        ])
        setGrievances(gList)
        setDepartments(dList)
        setOfficers(oList)
        setDivisions(divList)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const filtered = grievances.filter((g) => {
    const matchesSearch =
      !search ||
      g.id.toLowerCase().includes(search.toLowerCase()) ||
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      (g.citizenName && g.citizenName.toLowerCase().includes(search.toLowerCase()))

    const matchesStatus = statusFilter === 'all' || g.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || g.priority === priorityFilter
    const matchesDept =
      deptFilter === 'all' || (g.departmentIds && g.departmentIds.includes(deptFilter))
    const matchesCluster = !clusterFilter || !!g.clusterId

    return matchesSearch && matchesStatus && matchesPriority && matchesDept && matchesCluster
  })

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filtered.map((g) => g.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const getDeptName = (row) => {
    const dId = row.departmentIds?.[0]
    const dept = departments.find((d) => d.id === dId)
    if (dept) return lang === 'mr' && dept.nameMr ? dept.nameMr : dept.name
    return 'Engineering'
  }

  const getOfficerName = (row) => {
    if (row.assignedOfficerId) {
      const off = officers.find((o) => o.id === row.assignedOfficerId)
      if (off) return off.name
    }
    return <span className="text-amber-600 font-medium">Unassigned</span>
  }

  const columns = [
    {
      header: (
        <input
          type="checkbox"
          checked={selectedIds.length > 0 && selectedIds.length === filtered.length}
          onChange={handleSelectAll}
          className="rounded accent-brand-600 cursor-pointer"
        />
      ),
      accessor: 'checkbox',
      className: 'w-8',
      render: (row) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(row.id)}
          onChange={() => handleSelectOne(row.id)}
          className="rounded accent-brand-600 cursor-pointer"
        />
      ),
    },
    {
      header: 'ID',
      accessor: 'id',
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-brand-700 font-mono tracking-tight">{row.id}</span>
          {row.clusterId && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
              Cluster
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Complaint & Citizen',
      accessor: 'title',
      render: (row) => (
        <div className="max-w-xs">
          <span className="font-medium text-ink-900 block truncate">{row.title}</span>
          <span className="text-[11px] text-ink-400 block truncate">
            {row.citizenName || 'Citizen'} ({row.citizenMobile || '—'})
          </span>
        </div>
      ),
    },
    {
      header: 'Department',
      accessor: 'dept',
      render: (row) => <span className="text-xs text-ink-700">{getDeptName(row)}</span>,
    },
    {
      header: 'Assigned Officer',
      accessor: 'officer',
      render: (row) => <span className="text-xs">{getOfficerName(row)}</span>,
    },
    {
      header: 'Priority',
      accessor: 'priority',
      render: (row) => <PriorityBadge priority={row.priority} />,
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} label={t(`status.${row.status}`)} />,
    },
    {
      header: 'Action',
      align: 'right',
      render: (row) => (
        <button
          onClick={() => navigate(`/admin/grievances/${row.id}`)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-900 border border-brand-200 hover:border-brand-300 rounded-lg px-2.5 py-1 bg-white transition shadow-2xs cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Details</span>
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl lg:text-3xl text-ink-900 tracking-tight">
            Grievance Management
          </h1>
          <p className="text-xs sm:text-sm text-ink-500 mt-1">
            Browse, filter, assign, and manage all lodged complaints across MIDC zones.
          </p>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-brand-700 bg-brand-50 px-3 py-1.5 rounded-xl border border-brand-200">
              {selectedIds.length} Selected
            </span>
            <button
              onClick={() => alert(`Bulk actions for ${selectedIds.length} tickets simulated.`)}
              className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-brand cursor-pointer"
            >
              Bulk Assign
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-cream-200/90 shadow-card flex flex-wrap gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-ink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, title, or citizen..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-cream-300 bg-cream-50/50 text-xs text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-cream-300 bg-white text-xs font-medium text-ink-700 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="received">Received</option>
            <option value="assigned">Assigned</option>
            <option value="work_started">Work Started</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="action_not_taken">Overdue</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-cream-300 bg-white text-xs font-medium text-ink-700 cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-cream-300 bg-white text-xs font-medium text-ink-700 cursor-pointer"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setClusterFilter(!clusterFilter)}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold transition cursor-pointer ${
              clusterFilter
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-white text-ink-700 border-cream-300 hover:bg-cream-50'
            }`}
          >
            {clusterFilter ? 'Showing Clusters' : 'Filter Clusters'}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl p-6 border border-cream-200/90 shadow-card">
        <DataTable
          columns={columns}
          data={filtered}
          keyField="id"
          emptyMessage={loading ? 'Loading system grievances...' : 'No grievances matched the filters.'}
        />
      </div>
    </div>
  )
}
