import { useState, useEffect } from 'react'
import {
  Download,
  Calendar,
  Filter,
  FileSpreadsheet,
  FileText,
  BarChart2,
  PieChart as PieIcon,
  Send,
  AlertOctagon,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Star,
  Layers,
  Printer,
} from 'lucide-react'
import { api } from '../../services/api'
import { divisions, departments, industrialUnits } from '../../data/mockMaster'
import { calculatePortalMetrics } from '../../utils/metrics'

export default function ReportsAnalytics() {
  const [grievances, setGrievances] = useState([])
  const [selectedDivision, setSelectedDivision] = useState('all')
  const [selectedDept, setSelectedDept] = useState('all')

  // Daily Division Summary Modal (Step C5)
  const [showDailyReportModal, setShowDailyReportModal] = useState(false)

  // Notice form modal
  const [showNoticeModal, setShowNoticeModal] = useState(false)
  const [noticeDept, setNoticeDept] = useState('DEP-ENG')
  const [noticeMessage, setNoticeMessage] = useState('')
  const [noticeSent, setNoticeSent] = useState(false)

  useEffect(() => {
    async function load() {
      const g = await api.getGrievances()
      setGrievances(g)
    }
    load()
  }, [])

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['ID,Title,Department,Status,Priority,CreatedAt']
        .concat(
          grievances.map(
            (g) =>
              `"${g.id}","${g.title.replace(/"/g, '""')}","${g.departmentIds?.[0] || ''}","${
                g.status
              }","${g.priority}","${g.createdAt}"`
          )
        )
        .join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `MIDC_Grievance_Report_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleSendNotice = (e) => {
    e.preventDefault()
    setNoticeSent(true)
    setTimeout(() => {
      setNoticeSent(false)
      setShowNoticeModal(false)
      setNoticeMessage('')
    }, 2000)
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl lg:text-3xl text-ink-900 tracking-tight">
            Reports &amp; Analytics
          </h1>
          <p className="text-xs sm:text-sm text-ink-500 mt-1">
            Generate audit reports, division performance matrices, and issue formal notices.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowDailyReportModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cream-100 hover:bg-cream-200 text-ink-800 border border-cream-300 text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-brand-600" />
            <span>Today's Division Report</span>
          </button>

          <button
            onClick={() => setShowNoticeModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <AlertOctagon className="w-4 h-4 text-amber-600" />
            <span>Issue Department Notice</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-brand transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ================= STEP C2: SLIDE 12 KEY PERFORMANCE METRICS ================= */}
      {(() => {
        const metrics = calculatePortalMetrics(grievances)
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <div className="bg-white p-4 rounded-2xl border border-cream-200/90 shadow-card">
              <span className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider block mb-1">
                Avg Ack Time
              </span>
              <div className="font-display font-bold text-xl text-ink-900">
                {metrics.avgAckMinutes} min
              </div>
              <span className="text-[10px] text-emerald-600 font-medium">Target &lt; 30m</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-cream-200/90 shadow-card">
              <span className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider block mb-1">
                Time to Assign
              </span>
              <div className="font-display font-bold text-xl text-ink-900">
                {metrics.avgAssignmentHours} hrs
              </div>
              <span className="text-[10px] text-brand-600 font-medium">Auto-dispatch</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-cream-200/90 shadow-card">
              <span className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider block mb-1">
                Median Resolution
              </span>
              <div className="font-display font-bold text-xl text-ink-900">
                {metrics.medianResolutionDays} days
              </div>
              <span className="text-[10px] text-ink-400">90th %ile: {metrics.p90ResolutionDays}d</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-cream-200/90 shadow-card">
              <span className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider block mb-1">
                SLA Compliance
              </span>
              <div className="font-display font-bold text-xl text-emerald-700">
                {metrics.slaCompliancePct}%
              </div>
              <span className="text-[10px] text-emerald-600 font-medium">High Standard</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-cream-200/90 shadow-card">
              <span className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider block mb-1">
                Cluster Resol. %
              </span>
              <div className="font-display font-bold text-xl text-purple-700">
                {metrics.clusterResolutionPct}%
              </div>
              <span className="text-[10px] text-purple-600 font-medium">Duplicate linked</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-cream-200/90 shadow-card">
              <span className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider block mb-1">
                Citizen Rating
              </span>
              <div className="font-display font-bold text-xl text-amber-800 flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                <span>{metrics.avgRating}</span>
              </div>
              <span className="text-[10px] text-ink-400">Reopened: {metrics.reopenedRatePct}%</span>
            </div>
          </div>
        )
      })()}

      {/* Division Analytics Grid */}
      <div className="bg-white rounded-3xl p-6 border border-cream-200/90 shadow-card space-y-4">
        <h3 className="font-display font-bold text-base text-ink-900">
          Zonal Performance Summary (7 MIDC Divisions)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-cream-200 bg-cream-50/70 text-ink-600 font-semibold">
                <th className="py-3 px-4">Division</th>
                <th className="py-3 px-4">Industrial Areas</th>
                <th className="py-3 px-4">Total Logged</th>
                <th className="py-3 px-4">Resolved</th>
                <th className="py-3 px-4">SLA Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {divisions.map((div, i) => {
                const total = Math.floor(400 + i * 115)
                const resolved = Math.floor(total * 0.88)
                const compliance = 85 + (i % 12)
                return (
                  <tr key={div.id} className="hover:bg-cream-50/40">
                    <td className="py-3 px-4 font-bold text-ink-900">{div.name}</td>
                    <td className="py-3 px-4 text-ink-600">
                      {div.areas.map((a) => a.name).join(', ')}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium">{total}</td>
                    <td className="py-3 px-4 text-emerald-600 font-semibold">{resolved}</td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {compliance}%
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= STEP C3: REPEAT-COMPLAINT & INDUSTRIAL UNIT AUDIT ================= */}
      <div className="bg-white rounded-3xl p-6 border border-cream-200/90 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-ink-900">
              Repeat Complaints &amp; Industrial Unit Audit
            </h3>
            <p className="text-xs text-ink-500">
              Industrial units ranked by repeat complaints, environmental flags, and legal notices issued.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
            MIDC Regulatory Items 8–9
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-cream-200 bg-cream-50/70 text-ink-600 font-semibold">
                <th className="py-3 px-4">Industrial Unit / Company</th>
                <th className="py-3 px-4">Sector</th>
                <th className="py-3 px-4">Area</th>
                <th className="py-3 px-4">Complaints Count</th>
                <th className="py-3 px-4">Primary Category</th>
                <th className="py-3 px-4">Regulatory Action / Notice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {industrialUnits.slice(0, 7).map((u, i) => {
                const count = Math.max(1, (12 - i * 2) + (u.id === 'UNT-07' ? 4 : 0))
                const hasNotice = i < 3
                return (
                  <tr key={u.id} className="hover:bg-cream-50/40">
                    <td className="py-3 px-4 font-bold text-ink-900">
                      {u.name}
                    </td>
                    <td className="py-3 px-4 text-ink-600">{u.sector}</td>
                    <td className="py-3 px-4 text-ink-600 font-mono text-[11px]">{u.areaId}</td>
                    <td className="py-3 px-4 font-mono font-bold text-brand-700">
                      {count} reports
                    </td>
                    <td className="py-3 px-4 text-ink-700">
                      {i % 2 === 0 ? 'Effluent / Pollution' : 'Encroachment / Road Blockage'}
                    </td>
                    <td className="py-3 px-4">
                      {hasNotice ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                          Notice Issued (Sec 41)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-cream-100 text-ink-600">
                          Routine Observation
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notice Modal */}
      {showNoticeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-cream-200 shadow-raised space-y-4">
            <h3 className="font-display font-bold text-lg text-ink-900 flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-brand-600" />
              <span>Issue Official Department Notice</span>
            </h3>

            {noticeSent ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 text-xs rounded-xl font-medium text-center">
                Notice dispatched successfully to the department head.
              </div>
            ) : (
              <form onSubmit={handleSendNotice} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-ink-700 block mb-1">Target Department</label>
                  <select
                    value={noticeDept}
                    onChange={(e) => setNoticeDept(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-cream-300 bg-white"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-ink-700 block mb-1">Notice Content</label>
                  <textarea
                    rows={4}
                    required
                    value={noticeMessage}
                    onChange={(e) => setNoticeMessage(e.target.value)}
                    placeholder="Enter urgent compliance directive, SLA breach escalation, or field inspection memo..."
                    className="w-full p-3 rounded-xl border border-cream-300 bg-cream-50/50"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNoticeModal(false)}
                    className="px-4 py-2 bg-cream-100 hover:bg-cream-200 text-ink-700 rounded-xl font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold shadow-brand flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Notice</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ================= STEP C5: DAILY DIVISION REPORT MODAL ================= */}
      {showDailyReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-cream-200 shadow-raised space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-cream-200 pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-brand-600">
                  Daily Operations Summary
                </span>
                <h3 className="font-display font-bold text-lg text-ink-900">
                  MIDC Divisional Daily Status Report
                </h3>
                <span className="text-xs text-ink-500">
                  Generated: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-brand-200 bg-white hover:bg-brand-50 text-brand-700 text-xs font-semibold shadow-2xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Report</span>
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-cream-50 rounded-xl border border-cream-200">
                <span className="text-[10px] text-ink-500 block uppercase">Received</span>
                <span className="font-bold text-base text-ink-900">{grievances.length}</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-[10px] text-emerald-800 block uppercase">Resolved</span>
                <span className="font-bold text-base text-emerald-800">
                  {grievances.filter((g) => g.status === 'resolved' || g.status === 'closed').length}
                </span>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <span className="text-[10px] text-amber-800 block uppercase">In Progress</span>
                <span className="font-bold text-base text-amber-800">
                  {grievances.filter((g) => g.status === 'in_progress').length}
                </span>
              </div>
              <div className="p-3 bg-red-50 rounded-xl border border-red-200">
                <span className="text-[10px] text-red-800 block uppercase">Overdue</span>
                <span className="font-bold text-base text-red-700">
                  {grievances.filter((g) => g.status === 'action_not_taken').length}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-display font-bold text-xs uppercase tracking-wider text-ink-700">
                Division Breakedown &amp; Top Actionables
              </h4>
              <div className="space-y-2 text-xs">
                {divisions.map((d) => {
                  const divCount = grievances.filter((g) => g.divisionId === d.id).length || 8
                  const overdueCount = grievances.filter((g) => g.divisionId === d.id && g.status === 'action_not_taken').length
                  return (
                    <div key={d.id} className="p-3 rounded-xl border border-cream-200 bg-cream-50/50 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-ink-900 block">{d.name}</span>
                        <span className="text-[11px] text-ink-500">
                          Key Area: {d.areas?.[0]?.name || 'Industrial Estate'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <span className="font-mono font-bold text-ink-900">{divCount}</span>
                          <span className="text-[10px] text-ink-400 block">Total</span>
                        </div>
                        <div>
                          <span className="font-mono font-bold text-red-600">{overdueCount}</span>
                          <span className="text-[10px] text-ink-400 block">Breached</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-cream-200">
              <button
                type="button"
                onClick={() => setShowDailyReportModal(false)}
                className="px-5 py-2 bg-cream-200 hover:bg-cream-300 text-ink-800 rounded-xl font-semibold text-xs cursor-pointer transition"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
