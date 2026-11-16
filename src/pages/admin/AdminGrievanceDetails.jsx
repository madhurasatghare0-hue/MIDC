import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Building2,
  User,
  CheckCircle2,
  AlertCircle,
  Camera,
  Upload,
  UserCheck,
  Send,
  ShieldAlert,
} from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { api } from '../../services/api'
import StatusBadge from '../../components/common/StatusBadge'
import PriorityBadge from '../../components/common/PriorityBadge'
import MiniTracker from '../../components/common/MiniTracker'

export default function AdminGrievanceDetails() {
  const { id } = useParams()
  const { t, lang } = useLanguage()
  const navigate = useNavigate()

  const [grievance, setGrievance] = useState(null)
  const [loading, setLoading] = useState(true)
  const [departments, setDepartments] = useState([])
  const [officers, setOfficers] = useState([])

  // Action states
  const [selectedOfficer, setSelectedOfficer] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [actionComment, setActionComment] = useState('')
  const [progressPhoto, setProgressPhoto] = useState(null)
  const [photoError, setPhotoError] = useState('')
  const [savingAction, setSavingAction] = useState(false)
  const [actionSuccess, setActionSuccess] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [g, dList, oList] = await Promise.all([
          api.getGrievanceById(id),
          api.getDepartments(),
          api.getOfficers(),
        ])
        setGrievance(g)
        setDepartments(dList)
        setOfficers(oList)
        if (g) {
          setNewStatus(g.status)
          setSelectedOfficer(g.assignedOfficerId || '')
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id])

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setProgressPhoto(reader.result)
      setPhotoError('')
    }
    reader.readAsDataURL(file)
  }

  const handleUpdateStatus = async (e) => {
    e.preventDefault()
    if (!grievance) return

    // Require photo when resolving
    if (newStatus === 'resolved' && !progressPhoto) {
      setPhotoError(
        lang === 'mr'
          ? 'तक्रार निवारण (Resolved) करण्यासाठी कामाचा प्रत्यक्ष फोटो अपलोड करणे अनिवार्य आहे.'
          : 'Uploading a work completion photo is mandatory to resolve a grievance.'
      )
      return
    }

    setSavingAction(true)
    try {
      const updated = await api.updateGrievanceStatus(
        grievance.id,
        newStatus,
        actionComment || `Status set to ${newStatus} by Administrator`,
        'Administrator',
        {
          photo: progressPhoto,
          officerId: selectedOfficer,
        }
      )
      setGrievance(updated)
      setActionSuccess('Grievance status, photo evidence, and action log updated successfully!')
      setActionComment('')
      setProgressPhoto(null)
      setTimeout(() => setActionSuccess(''), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setSavingAction(false)
    }
  }

  if (loading) {
    return <div className="py-12 text-center text-xs text-ink-500">Loading complaint...</div>
  }

  if (!grievance) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-cream-200 text-center max-w-md mx-auto">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="font-display font-bold text-lg text-ink-900">Complaint Not Found</h2>
        <Link
          to="/admin/grievances"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold mt-4"
        >
          Back to Grievances
        </Link>
      </div>
    )
  }

  const dept = departments.find((d) => d.id === grievance.departmentIds?.[0])
  const officer = officers.find((o) => o.id === (selectedOfficer || grievance.assignedOfficerId))

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/grievances"
          className="inline-flex items-center gap-2 text-xs font-semibold text-ink-600 hover:text-ink-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Grievance Management</span>
        </Link>

        <div className="flex items-center gap-2">
          <StatusBadge status={grievance.status} label={t(`status.${grievance.status}`)} />
          <PriorityBadge priority={grievance.priority} />
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Main Details */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200/90 shadow-card space-y-6">
        <div>
          <span className="font-mono text-sm font-bold text-brand-700 block mb-1">
            {grievance.id}
          </span>
          <h1 className="font-display font-bold text-2xl text-ink-900">{grievance.title}</h1>
          <p className="text-xs text-ink-400 mt-1 flex flex-wrap items-center gap-3">
            <span>Submitted on: {new Date(grievance.createdAt).toLocaleString('en-GB')}</span>
            <span>Citizen: {grievance.citizenName || 'Rahul Deshmukh'}</span>
            <span>Mobile: {grievance.citizenMobile || '9876543210'}</span>
          </p>
        </div>

        {/* Location & Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-cream-50/70 border border-cream-200 space-y-2">
            <span className="font-bold text-ink-700 uppercase tracking-wider block">
              Complaint Description
            </span>
            <p className="text-ink-800 leading-relaxed">{grievance.description}</p>
          </div>

          <div className="p-4 rounded-2xl bg-cream-50/70 border border-cream-200 space-y-2">
            <span className="font-bold text-ink-700 uppercase tracking-wider block">
              Assignment & Location
            </span>
            <div className="space-y-1 text-ink-700">
              <p>
                <strong>Department:</strong> {dept?.name || 'Engineering'}
              </p>
              <p>
                <strong>Current Officer:</strong> {officer ? officer.name : 'Unassigned'}
              </p>
              <p>
                <strong>Address:</strong> {grievance.location?.address || 'Industrial Area'}
              </p>
              {grievance.industrialUnit && (
                <p>
                  <strong>Reported Unit:</strong>{' '}
                  <span className="text-brand-800 font-semibold">{grievance.industrialUnit}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Admin Action Panel (Update Status / Reassign) */}
        <div className="p-6 rounded-2xl bg-brand-50/50 border border-brand-200/70 space-y-4">
          <h3 className="font-display font-bold text-base text-ink-900 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-brand-600" />
            <span>Officer Action &amp; Status Override</span>
          </h3>

          <form onSubmit={handleUpdateStatus} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-ink-700 block mb-1">Update Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-cream-300 bg-white text-xs font-semibold text-ink-900"
                >
                  <option value="received">Received</option>
                  <option value="assigned">Assigned</option>
                  <option value="work_started">Work Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="reopened">Reopened</option>
                  <option value="closed">Closed</option>
                  <option value="action_not_taken">Action Not Taken / Overdue</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-ink-700 block mb-1">Assign Officer</label>
                <select
                  value={selectedOfficer}
                  onChange={(e) => setSelectedOfficer(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-cream-300 bg-white text-xs font-semibold text-ink-900"
                >
                  <option value="">Unassigned</option>
                  {officers.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name} ({o.designation})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Officer Progress / Work Evidence Photo */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-ink-700 block">
                  Officer Inspection / Progress Photo{' '}
                  {newStatus === 'resolved' && (
                    <span className="text-red-500 font-extrabold">* (Required for resolution)</span>
                  )}
                </label>
                {progressPhoto && (
                  <button
                    type="button"
                    onClick={() => setProgressPhoto(null)}
                    className="text-[11px] text-red-600 font-semibold hover:underline cursor-pointer"
                  >
                    Remove photo
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-cream-300 hover:border-brand-300 rounded-xl text-xs font-semibold text-brand-700 shadow-2xs">
                  <Camera className="w-4 h-4 text-brand-600" />
                  <span>{progressPhoto ? 'Change Progress Photo' : 'Upload Progress Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>

                {progressPhoto && (
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-cream-300 shadow-xs shrink-0">
                    <img src={progressPhoto} alt="Work progress" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {photoError && (
                <p className="text-xs text-red-600 font-medium mt-1">{photoError}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-ink-700 block mb-1">
                Action Log / Work Remarks
              </label>
              <textarea
                rows={2}
                value={actionComment}
                onChange={(e) => setActionComment(e.target.value)}
                placeholder="Enter status update remarks, inspection notes, or resolution confirmation..."
                className="w-full p-3 rounded-xl border border-cream-300 bg-white text-xs text-ink-900 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingAction}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-brand transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{savingAction ? 'Recording...' : 'Update Grievance'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Timeline Log */}
        <div className="space-y-4 pt-4 border-t border-cream-200">
          <h3 className="font-display font-bold text-base text-ink-900">
            Action &amp; Audit Trail
          </h3>

          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-cream-300">
            {grievance.timeline?.map((step, idx) => (
              <div key={idx} className="relative">
                <span className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center text-[10px] ring-4 ring-brand-50">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>

                <div className="bg-cream-50/70 p-3 rounded-xl border border-cream-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-ink-900 capitalize">
                      {step.status}
                    </span>
                    <span className="text-[11px] text-ink-400">
                      {step.at ? new Date(step.at).toLocaleString('en-GB') : ''}
                    </span>
                  </div>
                  <p className="text-xs text-ink-700">{step.note || step.comment}</p>
                  {step.photo && (
                    <div className="mt-2 w-28 h-20 rounded-lg overflow-hidden border border-cream-300 shadow-2xs">
                      <img src={step.photo} alt="Timeline progress" className="w-full h-full object-cover" />
                    </div>
                  )}
                  {step.by && (
                    <span className="text-[10px] font-semibold text-ink-400 mt-1 block">
                      Actor: {step.by}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
