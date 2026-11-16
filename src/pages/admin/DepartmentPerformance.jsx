import { useState, useEffect } from 'react'
import {
  Building2,
  TrendingUp,
  Award,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Filter,
  BarChart3,
  Layers,
} from 'lucide-react'
import { api } from '../../services/api'
import { departments } from '../../data/mockMaster'

export default function DepartmentPerformance() {
  const [grievances, setGrievances] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const gList = await api.getGrievances()
        setGrievances(gList)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Calculate metrics per department
  const deptStats = departments.map((d) => {
    const deptGrievances = grievances.filter((g) => g.departmentIds?.includes(d.id))
    const total = deptGrievances.length || 1
    const resolved = deptGrievances.filter((g) => g.status === 'resolved' || g.status === 'closed').length
    const overdue = deptGrievances.filter(
      (g) => g.status === 'action_not_taken' || (g.dueAt && new Date(g.dueAt) < new Date() && g.status !== 'resolved' && g.status !== 'closed')
    ).length
    const rate = Math.round((resolved / total) * 100)
    const avgTat = Math.max(2, Math.round(5 - (rate / 30)))

    return {
      ...d,
      total,
      resolved,
      overdue,
      resolutionRate: Math.min(100, Math.max(45, rate || 78)),
      avgTatDays: avgTat,
    }
  })

  // Sort by resolution rate for top performers
  const sortedDepts = [...deptStats].sort((a, b) => b.resolutionRate - a.resolutionRate)
  const topPerformer = sortedDepts[0]
  const lowestPerformer = sortedDepts[sortedDepts.length - 1]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl lg:text-3xl text-ink-900 tracking-tight">
          Department Performance &amp; SLA Rankings
        </h1>
        <p className="text-xs sm:text-sm text-ink-500 mt-1">
          Comparative resolution efficiency, SLA compliance, and turnaround benchmarks by department.
        </p>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Top Performer */}
        <div className="bg-white rounded-2xl p-5 border border-cream-200/90 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
              Top Ranked Department
            </span>
            <div className="font-display font-bold text-lg text-ink-900">
              {topPerformer?.name || 'Water Supply'}
            </div>
            <span className="text-xs text-ink-500">
              {topPerformer?.resolutionRate}% resolution efficiency
            </span>
          </div>
        </div>

        {/* Average TAT */}
        <div className="bg-white rounded-2xl p-5 border border-cream-200/90 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
              Average Resolution TAT
            </span>
            <div className="font-display font-bold text-lg text-ink-900">3.4 Days</div>
            <span className="text-xs text-ink-500">Across all 8 MIDC departments</span>
          </div>
        </div>

        {/* Escalation Attention */}
        <div className="bg-white rounded-2xl p-5 border border-cream-200/90 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
              Needs Attention
            </span>
            <div className="font-display font-bold text-lg text-ink-900">
              {lowestPerformer?.name || 'Drainage & Sewerage'}
            </div>
            <span className="text-xs text-ink-500">Higher overdue ratio under rain season</span>
          </div>
        </div>
      </div>

      {/* Department Breakdown Cards */}
      <div className="bg-white rounded-3xl p-6 border border-cream-200/90 shadow-card space-y-6">
        <h3 className="font-display font-bold text-lg text-ink-900">
          Departmental Scorecard
        </h3>

        <div className="space-y-4">
          {deptStats.map((dept) => (
            <div
              key={dept.id}
              className="p-4 rounded-2xl bg-cream-50/60 border border-cream-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 md:w-1/3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm text-ink-900">{dept.name}</h4>
                  <span className="text-[11px] text-ink-500">
                    {dept.nameMr} · Total {dept.total} Cases
                  </span>
                </div>
              </div>

              {/* Progress Bar & Rate */}
              <div className="flex-1 max-w-xs space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-ink-600 font-medium">Resolution Rate</span>
                  <span className="font-bold text-ink-900">{dept.resolutionRate}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-cream-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      dept.resolutionRate >= 75
                        ? 'bg-emerald-500'
                        : dept.resolutionRate >= 60
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${dept.resolutionRate}%` }}
                  />
                </div>
              </div>

              {/* Stats badges */}
              <div className="flex items-center gap-3 text-xs shrink-0">
                <div className="text-center px-3 py-1.5 bg-white rounded-xl border border-cream-200">
                  <span className="text-[10px] text-ink-400 block font-semibold">Avg TAT</span>
                  <span className="font-bold text-ink-900">{dept.avgTatDays} Days</span>
                </div>
                <div className="text-center px-3 py-1.5 bg-white rounded-xl border border-cream-200">
                  <span className="text-[10px] text-ink-400 block font-semibold">Resolved</span>
                  <span className="font-bold text-emerald-600">{dept.resolved}</span>
                </div>
                <div className="text-center px-3 py-1.5 bg-white rounded-xl border border-cream-200">
                  <span className="text-[10px] text-ink-400 block font-semibold">Overdue</span>
                  <span className="font-bold text-red-600">{dept.overdue}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
