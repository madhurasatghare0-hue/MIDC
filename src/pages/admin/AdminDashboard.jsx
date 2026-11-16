import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FileText,
  Clock,
  Settings as SettingsIcon,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Building2,
  ChevronDown,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { api } from '../../services/api'
import { calculatePortalMetrics } from '../../utils/metrics'
import StatusBadge from '../../components/common/StatusBadge'
import DataTable from '../../components/common/DataTable'

export default function AdminDashboard() {
  const { user } = useAuth()
  const { t, lang } = useLanguage()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [grievances, setGrievances] = useState([])
  const [departments, setDepartments] = useState([])
  const [officers, setOfficers] = useState([])

  useEffect(() => {
    async function loadAdminData() {
      try {
        setLoading(true)
        // Run SLA automated check on dashboard load
        await api.runSlaCheck()

        const [gList, dList, oList] = await Promise.all([
          api.getGrievances(),
          api.getDepartments(),
          api.getOfficers(),
        ])
        setGrievances(gList)
        setDepartments(dList)
        setOfficers(oList)
      } catch (err) {
        console.error('Failed to load admin dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadAdminData()
  }, [])

  // 1. KPI Counts from real data
  const metrics = calculatePortalMetrics(grievances)
  const totalCount = grievances.length
  const pendingCount = metrics.workNotStarted
  const inProgressCount = grievances.filter((g) => g.status === 'in_progress').length
  const resolvedCount = metrics.closedThisMonth + grievances.filter((g) => g.status === 'resolved').length
  const overdueCount = metrics.overdue

  // Percentages for Donut
  const pctResolved = totalCount ? ((grievances.filter((g) => g.status === 'resolved' || g.status === 'closed').length / totalCount) * 100).toFixed(1) : '0'
  const pctInProgress = totalCount ? ((inProgressCount / totalCount) * 100).toFixed(1) : '0'
  const pctPending = totalCount ? ((pendingCount / totalCount) * 100).toFixed(1) : '0'
  const pctOverdue = totalCount ? ((overdueCount / totalCount) * 100).toFixed(1) : '0'

  // Department distribution
  const deptCounts = {
    'Engineering': grievances.filter((g) => g.departmentIds?.includes('DEP-ENG')).length,
    'Electrical': grievances.filter((g) => g.departmentIds?.includes('DEP-ELE')).length,
    'Infrastructure': grievances.filter((g) => g.departmentIds?.includes('DEP-DRN') || g.departmentIds?.includes('DEP-EST')).length,
    'Water Supply': grievances.filter((g) => g.departmentIds?.includes('DEP-WAT')).length,
    'Others': grievances.filter((g) => g.departmentIds?.includes('DEP-SAN') || g.departmentIds?.includes('DEP-ENV') || g.departmentIds?.includes('DEP-FIR')).length,
  }
  const maxDept = Math.max(...Object.values(deptCounts), 1)

  // Recent 5 grievances for table
  const recentGrievances = grievances.slice(0, 5)

  // Calculate TAT / Age from createdAt
  const getAgeDays = (isoStr) => {
    if (!isoStr) return '1 Day'
    const diffMs = Date.now() - new Date(isoStr).getTime()
    const days = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
    return `${days} Day${days > 1 ? 's' : ''}`
  }

  const getOfficerName = (g) => {
    if (g.assignedOfficerId) {
      const off = officers.find((o) => o.id === g.assignedOfficerId)
      if (off) return off.name
    }
    if (g.departmentIds?.includes('DEP-ENG')) return 'JE - Zone 1'
    if (g.departmentIds?.includes('DEP-ELE')) return 'AE - Electrical'
    if (g.departmentIds?.includes('DEP-WAT') || g.departmentIds?.includes('DEP-DRN')) return 'JE - Civil'
    return 'Admin Staff'
  }

  const getDeptName = (g) => {
    if (g.departmentIds?.[0]) {
      const d = departments.find((dept) => dept.id === g.departmentIds[0])
      if (d) return lang === 'mr' && d.nameMr ? d.nameMr : d.name
    }
    return 'Engineering'
  }

  const tableColumns = [
    {
      header: 'Grievance ID',
      accessor: 'id',
      render: (row) => (
        <span className="font-semibold text-brand-700 font-mono tracking-tight">
          {row.id}
        </span>
      ),
    },
    {
      header: 'Complaint',
      accessor: 'title',
      render: (row) => (
        <span className="font-medium text-ink-900 block max-w-xs truncate">
          {row.title}
        </span>
      ),
    },
    {
      header: 'Department',
      accessor: 'dept',
      render: (row) => <span className="text-xs text-ink-700">{getDeptName(row)}</span>,
    },
    {
      header: 'Assigned To',
      accessor: 'assigned',
      render: (row) => <span className="text-xs text-ink-600">{getOfficerName(row)}</span>,
    },
    {
      header: 'Submitted Date',
      accessor: 'createdAt',
      render: (row) => (
        <span className="text-xs text-ink-600">
          {row.createdAt
            ? new Date(row.createdAt).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })
            : '01 Jan 2025'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} label={t(`status.${row.status}`)} />,
    },
    {
      header: 'TAT / Age',
      accessor: 'age',
      render: (row) => (
        <span className="text-xs font-semibold text-ink-600">{getAgeDays(row.createdAt)}</span>
      ),
    },
    {
      header: 'Action',
      align: 'right',
      render: (row) => (
        <button
          onClick={() => navigate(`/admin/grievances/${row.id}`)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-900 border border-brand-200/90 hover:border-brand-300 rounded-lg px-2.5 py-1 bg-white transition shadow-2xs cursor-pointer"
        >
          <span>View Details</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* ================= 1. ADMINISTRATOR VIEW BANNER ================= */}
      <div className="relative overflow-hidden rounded-3xl bg-cream-100 border border-cream-200/90 shadow-card min-h-[170px]">
        {/* Background panoramic industrial estate photo */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/login-bg.jpg"
            alt="MIDC Industrial Area"
            className="w-full h-full object-cover object-center"
          />
          {/* Subtle gradient to preserve high text contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-cream-100/95 via-cream-100/40 to-transparent w-full md:w-3/5" />
          <div className="absolute inset-0 bg-gradient-to-t from-cream-100/50 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 p-6 md:p-8 max-w-2xl">
          <div className="inline-flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold tracking-widest text-brand-600 uppercase">
              ADMINISTRATOR VIEW
            </span>
            <span className="w-8 h-[2px] bg-brand-300 rounded-full" />
          </div>

          <h2 className="font-display font-extrabold text-2xl md:text-3xl text-ink-900 leading-tight tracking-tight mb-2">
            Grievance Monitoring &amp; Resolution Dashboard
          </h2>

          <p className="text-xs md:text-sm text-ink-600 leading-relaxed">
            Oversee, assign, monitor and ensure timely resolution of all grievances across departments.
          </p>
        </div>
      </div>

      {/* ================= 2. 5 KPI CARDS (COMPUTED DYNAMICALLY) ================= */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Open Complaints */}
        <div className="bg-white rounded-2xl p-4 border border-cream-200/90 shadow-card flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-medium text-ink-500 block">Open Complaints</span>
            <div className="font-display font-bold text-xl lg:text-2xl text-ink-900 tracking-tight">
              {metrics.open.toLocaleString()}
            </div>
            <div className="text-[11px] font-medium text-ink-500 mt-0.5">
              <span>Active in pipeline</span>
            </div>
          </div>
        </div>

        {/* High Priority */}
        <div className="bg-white rounded-2xl p-4 border border-cream-200/90 shadow-card flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-medium text-ink-500 block">High Priority</span>
            <div className="font-display font-bold text-xl lg:text-2xl text-amber-800 tracking-tight">
              {metrics.highPriority.toLocaleString()}
            </div>
            <div className="text-[11px] font-medium text-amber-600 mt-0.5">
              <span>Urgent action</span>
            </div>
          </div>
        </div>

        {/* Overdue / SLA Breached */}
        <div className="bg-white rounded-2xl p-4 border border-cream-200/90 shadow-card flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-medium text-ink-500 block">Overdue (SLA)</span>
            <div className="font-display font-bold text-xl lg:text-2xl text-red-700 tracking-tight">
              {metrics.overdue.toLocaleString()}
            </div>
            <div className="text-[11px] font-semibold text-red-600 mt-0.5">
              <span>{metrics.overdue > 0 ? 'Escalated' : 'On Track'}</span>
            </div>
          </div>
        </div>

        {/* Closed This Month */}
        <div className="bg-white rounded-2xl p-4 border border-cream-200/90 shadow-card flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-medium text-ink-500 block">Closed (Month)</span>
            <div className="font-display font-bold text-xl lg:text-2xl text-ink-900 tracking-tight">
              {metrics.closedThisMonth.toLocaleString()}
            </div>
            <div className="text-[11px] font-semibold text-emerald-600 mt-0.5">
              <span>SLA {metrics.slaCompliancePct}%</span>
            </div>
          </div>
        </div>

        {/* Work Not Started */}
        <div className="bg-white rounded-2xl p-4 border border-cream-200/90 shadow-card flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center shrink-0">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-medium text-ink-500 block">Work Not Started</span>
            <div className="font-display font-bold text-xl lg:text-2xl text-ink-900 tracking-tight">
              {metrics.workNotStarted.toLocaleString()}
            </div>
            <div className="text-[11px] font-medium text-ink-400 mt-0.5">
              <span>Unassigned / New</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 3. ANALYTICS ROW (TREND, DONUT, DEPARTMENTS) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Trend Chart (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-cream-200/90 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-600" />
              <h4 className="font-display font-bold text-sm text-ink-900">Grievance Trend</h4>
            </div>
            <div className="flex items-center gap-1 text-xs text-ink-500 px-2 py-1 rounded-lg border border-cream-200 bg-cream-50">
              <span>Last 6 Months</span>
              <ChevronDown className="w-3 h-3 text-ink-400" />
            </div>
          </div>

          {/* SVG Trend Line Chart */}
          <div className="relative py-2">
            {/* Peak Callout Badge */}
            <div className="absolute right-8 top-1 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs">
              {totalCount > 0 ? `${totalCount} Registered` : '0 Active'}
            </div>

            <svg viewBox="0 0 320 130" className="w-full h-32 overflow-visible">
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C2532F" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#C2532F" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid guide lines */}
              <line x1="30" y1="20" x2="310" y2="20" stroke="#EADFD0" strokeDasharray="3 3" />
              <line x1="30" y1="50" x2="310" y2="50" stroke="#EADFD0" strokeDasharray="3 3" />
              <line x1="30" y1="80" x2="310" y2="80" stroke="#EADFD0" strokeDasharray="3 3" />
              <line x1="30" y1="110" x2="310" y2="110" stroke="#EADFD0" />

              {/* Y Axis text */}
              <text x="5" y="24" fontSize="9" fill="#8E857D">1,500</text>
              <text x="5" y="54" fontSize="9" fill="#8E857D">1,200</text>
              <text x="14" y="84" fontSize="9" fill="#8E857D">900</text>
              <text x="14" y="114" fontSize="9" fill="#8E857D">600</text>

              {/* Shaded Area under curve */}
              <path
                d="M 40 100 L 90 92 L 140 76 L 190 78 L 240 50 L 290 46 L 290 110 L 40 110 Z"
                fill="url(#trendGradient)"
              />

              {/* Curved line */}
              <path
                d="M 40 100 L 90 92 L 140 76 L 190 78 L 240 50 L 290 46"
                fill="none"
                stroke="#C2532F"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Data point dots */}
              {[[40, 100], [90, 92], [140, 76], [190, 78], [240, 50], [290, 46]].map(
                ([cx, cy], i) => (
                  <circle
                    key={i}
                    cx={cx}
                    cy={cy}
                    r="3.5"
                    fill="#FFF"
                    stroke="#C2532F"
                    strokeWidth="2"
                  />
                )
              )}

              {/* X Axis labels */}
              <text x="35" y="125" fontSize="9" fill="#8E857D">Jul</text>
              <text x="85" y="125" fontSize="9" fill="#8E857D">Aug</text>
              <text x="135" y="125" fontSize="9" fill="#8E857D">Sep</text>
              <text x="185" y="125" fontSize="9" fill="#8E857D">Oct</text>
              <text x="235" y="125" fontSize="9" fill="#8E857D">Nov</text>
              <text x="285" y="125" fontSize="9" fill="#8E857D">Dec</text>
            </svg>
          </div>
        </div>

        {/* Grievances by Status (Donut Chart - 4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-cream-200/90 shadow-card flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <PieIcon className="w-4 h-4 text-brand-600" />
            <h4 className="font-display font-bold text-sm text-ink-900">Grievances by Status</h4>
          </div>

          <div className="flex items-center justify-between gap-2 py-2">
            {/* SVG Circular Donut Chart */}
            <div className="relative w-32 h-32 shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {/* Background Ring */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#F5EDE2" strokeWidth="14" />
                {/* Resolved segment (36.1%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#8A3622"
                  strokeWidth="14"
                  strokeDasharray="86.2 238.8"
                  strokeDashoffset="0"
                />
                {/* In Progress segment (40.3%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#E8B04A"
                  strokeWidth="14"
                  strokeDasharray="96.2 238.8"
                  strokeDashoffset="-86.2"
                />
                {/* Pending segment (21.7%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#F3CF7A"
                  strokeWidth="14"
                  strokeDasharray="51.8 238.8"
                  strokeDashoffset="-182.4"
                />
                {/* Overdue segment (1.8%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#D6453D"
                  strokeWidth="14"
                  strokeDasharray="4.6 238.8"
                  strokeDashoffset="-234.2"
                />
              </svg>
              {/* Inner Center Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-display font-extrabold text-sm text-ink-900">
                  {totalCount.toLocaleString()}
                </span>
                <span className="text-[10px] text-ink-400">Total</span>
              </div>
            </div>

            {/* Legend List with Percentages */}
            <div className="space-y-1.5 text-xs flex-1 pl-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-700" />
                  <span className="text-ink-700">Resolved</span>
                </div>
                <span className="font-bold text-ink-900">{pctResolved}%</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-gold-400" />
                  <span className="text-ink-700">In Progress</span>
                </div>
                <span className="font-bold text-ink-900">{pctInProgress}%</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-gold-300" />
                  <span className="text-ink-700">Pending</span>
                </div>
                <span className="font-bold text-ink-900">{pctPending}%</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-status-overdue" />
                  <span className="text-ink-700">Overdue</span>
                </div>
                <span className="font-bold text-ink-900">{pctOverdue}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Grievances by Department (Horizontal Bars - 4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-cream-200/90 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-brand-600" />
              <h4 className="font-display font-bold text-sm text-ink-900">Grievances by Department</h4>
            </div>
            <Link
              to="/admin/departments"
              className="text-[11px] font-semibold text-brand-700 hover:underline"
            >
              View All →
            </Link>
          </div>

          <div className="space-y-3 py-1 text-xs">
            {/* Engineering */}
            <div>
              <div className="flex justify-between text-ink-700 mb-1">
                <span>Engineering</span>
                <span className="font-bold text-ink-900">1,826</span>
              </div>
              <div className="w-full h-2 rounded-full bg-cream-200 overflow-hidden">
                <div className="h-full bg-brand-700 rounded-full" style={{ width: '85%' }} />
              </div>
            </div>

            {/* Electrical */}
            <div>
              <div className="flex justify-between text-ink-700 mb-1">
                <span>Electrical</span>
                <span className="font-bold text-ink-900">1,104</span>
              </div>
              <div className="w-full h-2 rounded-full bg-cream-200 overflow-hidden">
                <div className="h-full bg-brand-400 rounded-full" style={{ width: '60%' }} />
              </div>
            </div>

            {/* Infrastructure */}
            <div>
              <div className="flex justify-between text-ink-700 mb-1">
                <span>Infrastructure</span>
                <span className="font-bold text-ink-900">982</span>
              </div>
              <div className="w-full h-2 rounded-full bg-cream-200 overflow-hidden">
                <div className="h-full bg-gold-400 rounded-full" style={{ width: '52%' }} />
              </div>
            </div>

            {/* Water Supply */}
            <div>
              <div className="flex justify-between text-ink-700 mb-1">
                <span>Water Supply</span>
                <span className="font-bold text-ink-900">728</span>
              </div>
              <div className="w-full h-2 rounded-full bg-cream-200 overflow-hidden">
                <div className="h-full bg-gold-300 rounded-full" style={{ width: '40%' }} />
              </div>
            </div>

            {/* Others */}
            <div>
              <div className="flex justify-between text-ink-700 mb-1">
                <span>Others</span>
                <span className="font-bold text-ink-900">402</span>
              </div>
              <div className="w-full h-2 rounded-full bg-cream-200 overflow-hidden">
                <div className="h-full bg-cream-300 rounded-full" style={{ width: '22%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 4. RECENT GRIEVANCES TABLE ================= */}
      <div className="bg-white rounded-3xl p-6 border border-cream-200/90 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">📋</span>
            <h3 className="font-display font-bold text-lg text-ink-900">Recent Grievances</h3>
          </div>
          <Link
            to="/admin/grievances"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-brand-900 transition"
          >
            <span>View All Grievances</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <DataTable
          columns={tableColumns}
          data={recentGrievances}
          keyField="id"
          emptyMessage={loading ? 'Loading system grievances...' : 'No grievances found.'}
        />
      </div>
    </div>
  )
}
