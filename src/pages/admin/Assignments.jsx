import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { UserCheck, Building2, Phone, CheckCircle2, Clock } from 'lucide-react'
import { api } from '../../services/api'

export default function Assignments() {
  const [officers, setOfficers] = useState([])
  const [grievances, setGrievances] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const [oList, gList, dList] = await Promise.all([
          api.getOfficers(),
          api.getGrievances(),
          api.getDepartments(),
        ])
        setOfficers(oList)
        setGrievances(gList)
        setDepartments(dList)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl lg:text-3xl text-ink-900 tracking-tight">
          Field Officer Assignments
        </h1>
        <p className="text-xs sm:text-sm text-ink-500 mt-1">
          Monitor caseload distribution and officer assignments across industrial divisions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {officers.map((officer) => {
          const dept = departments.find((d) => d.id === officer.departmentId)
          const assignedCount = grievances.filter(
            (g) => g.assignedOfficerId === officer.id && g.status !== 'resolved' && g.status !== 'closed'
          ).length

          return (
            <div
              key={officer.id}
              className="bg-white rounded-2xl p-5 border border-cream-200/90 shadow-card space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display font-bold text-base text-ink-900">{officer.name}</h3>
                  <span className="text-xs text-brand-700 font-semibold">{officer.designation}</span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  {assignedCount} Active
                </span>
              </div>

              <div className="text-xs text-ink-600 space-y-1 pt-2 border-t border-cream-100">
                <p>
                  <strong>Dept:</strong> {dept?.name || 'Engineering'}
                </p>
                <p>
                  <strong>Contact:</strong> {officer.phone}
                </p>
              </div>

              <Link
                to={`/admin/grievances?officer=${officer.id}`}
                className="w-full text-center py-2 bg-cream-50 hover:bg-cream-100 rounded-xl text-xs font-semibold text-ink-700 block transition border border-cream-200"
              >
                View Assigned Complaints
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}
