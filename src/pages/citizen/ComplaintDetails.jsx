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
  MessageSquare,
  Share2,
  Star,
  RotateCcw,
  Check,
} from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { api } from '../../services/api'
import StatusBadge from '../../components/common/StatusBadge'
import PriorityBadge from '../../components/common/PriorityBadge'
import MiniTracker from '../../components/common/MiniTracker'

export default function ComplaintDetails() {
  const { id } = useParams()
  const { t, lang } = useLanguage()
  const navigate = useNavigate()

  const [grievance, setGrievance] = useState(null)
  const [loading, setLoading] = useState(true)
  const [departments, setDepartments] = useState([])
  const [officers, setOfficers] = useState([])

  // Citizen Feedback / Reopen states
  const [selectedRating, setSelectedRating] = useState(5)
  const [ratingFeedback, setRatingFeedback] = useState('')
  const [submittingRating, setSubmittingRating] = useState(false)
  const [showReopenBox, setShowReopenBox] = useState(false)
  const [reopenReason, setReopenReason] = useState('')
  const [submittingReopen, setSubmittingReopen] = useState(false)
  const [feedbackSuccess, setFeedbackSuccess] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [item, deptList, offList] = await Promise.all([
          api.getGrievanceById(id),
          api.getDepartments(),
          api.getOfficers(),
        ])
        setGrievance(item)
        setDepartments(deptList)
        setOfficers(offList)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id])

  const handleRateResolution = async () => {
    if (!grievance) return
    setSubmittingRating(true)
    try {
      const updated = await api.submitGrievanceRating(grievance.id, selectedRating, ratingFeedback)
      setGrievance(updated)
      setFeedbackSuccess(
        lang === 'mr'
          ? 'आपल्या अभिप्रायाबद्दल धन्यवाद! तक्रार अधिकृतरीत्या बंद करण्यात आली आहे.'
          : 'Thank you for your feedback! Complaint has been officially closed.'
      )
    } catch (err) {
      console.error(err)
    } finally {
      setSubmittingRating(false)
    }
  }

  const handleReopenComplaint = async () => {
    if (!grievance || !reopenReason.trim()) return
    setSubmittingReopen(true)
    try {
      const updated = await api.reopenGrievance(grievance.id, reopenReason, grievance.citizen?.name || 'Citizen')
      setGrievance(updated)
      setShowReopenBox(false)
      setFeedbackSuccess(
        lang === 'mr'
          ? 'तक्रार पुन्हा उघडण्यात आली आहे. संबंधित अधिकारी लवकरच पुन्हा पाहणी करतील.'
          : 'Complaint has been reopened. Assigned department will review again.'
      )
    } catch (err) {
      console.error(err)
    } finally {
      setSubmittingReopen(false)
    }
  }

  if (loading) {
    return (
      <div className="py-12 text-center text-ink-500 text-sm">
        Loading complaint details...
      </div>
    )
  }

  if (!grievance) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-cream-200 text-center max-w-md mx-auto">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="font-display font-bold text-lg text-ink-900">Complaint Not Found</h2>
        <p className="text-xs text-ink-500 mt-1 mb-4">The requested ticket ID does not exist.</p>
        <Link
          to="/citizen/grievances"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold"
        >
          Back to Grievances
        </Link>
      </div>
    )
  }

  const dept = departments.find((d) => d.id === grievance.departmentIds?.[0])
  const officer = officers.find((o) => o.id === grievance.assignedOfficerId)

  // Stepper representation
  const stepOrder = ['received', 'assigned', 'work_started', 'in_progress', 'resolved']
  const curIndex = stepOrder.indexOf(grievance.status)

  const trackerSteps = [
    {
      label: t('status.received'),
      date: grievance.createdAt?.split('T')[0] || '',
      state: curIndex >= 0 ? (curIndex === 0 ? 'active' : 'completed') : 'completed',
    },
    {
      label: t('status.assigned'),
      date: grievance.timeline?.find((x) => x.status === 'assigned')?.at?.split('T')[0] || '',
      state: curIndex >= 1 ? (curIndex === 1 ? 'active' : 'completed') : 'upcoming',
    },
    {
      label: t('status.work_started'),
      date: grievance.timeline?.find((x) => x.status === 'work_started')?.at?.split('T')[0] || '',
      state: curIndex >= 2 ? (curIndex === 2 ? 'active' : 'completed') : 'upcoming',
    },
    {
      label: t('status.in_progress'),
      date: grievance.timeline?.find((x) => x.status === 'in_progress')?.at?.split('T')[0] || '',
      state: curIndex >= 3 ? (curIndex === 3 ? 'active' : 'completed') : 'upcoming',
    },
    {
      label: `${t('status.resolved')} / ${t('status.closed')}`,
      date: grievance.resolvedAt?.split('T')[0] || '',
      state: grievance.status === 'resolved' || grievance.status === 'closed' ? 'completed' : 'upcoming',
    },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/citizen/grievances"
          className="inline-flex items-center gap-2 text-xs font-semibold text-ink-600 hover:text-ink-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Complaints</span>
        </Link>

        <div className="flex items-center gap-2">
          <StatusBadge status={grievance.status} label={t(`status.${grievance.status}`)} />
          <PriorityBadge priority={grievance.priority} />
        </div>
      </div>

      {/* Main Details Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200/90 shadow-card space-y-6">
        <div>
          <span className="font-mono text-sm font-bold text-brand-700 block mb-1">
            {grievance.id}
          </span>
          <h1 className="font-display font-bold text-2xl text-ink-900">
            {grievance.title}
          </h1>
          <p className="text-xs text-ink-400 mt-1 flex items-center gap-3">
            <span>
              Submitted on:{' '}
              {new Date(grievance.createdAt).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            {grievance.dueAt && (
              <span className="text-amber-700 font-semibold">
                SLA Target:{' '}
                {new Date(grievance.dueAt).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                })}
              </span>
            )}
          </p>
        </div>

        {/* Stepper Card */}
        <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200">
          <MiniTracker steps={trackerSteps} />
        </div>

        {/* Description & Location Grid */}
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
            <div className="space-y-1.5 text-ink-700">
              <div className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-brand-600" />
                <span>
                  <strong>Department:</strong>{' '}
                  {dept ? (lang === 'mr' ? dept.nameMr : dept.name) : 'Engineering'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-brand-600" />
                <span>
                  <strong>Officer:</strong> {officer ? officer.name : 'Pending assignment'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-brand-600" />
                <span>
                  <strong>Location:</strong> {grievance.location?.address || 'Industrial Area'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Attached Photos (if any) */}
        {grievance.photos && grievance.photos.length > 0 && (
          <div className="space-y-2">
            <span className="font-bold text-ink-700 text-xs uppercase tracking-wider block">
              Attached Photographs
            </span>
            <div className="flex gap-3">
              {grievance.photos.map((src, i) => (
                <div
                  key={i}
                  className="w-24 h-24 rounded-xl overflow-hidden border border-cream-300 shadow-xs"
                >
                  <img
                    src={src}
                    alt="Complaint photo"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity Timeline */}
        <div className="space-y-4 pt-4 border-t border-cream-200">
          <h3 className="font-display font-bold text-base text-ink-900">
            Action & Progress Timeline
          </h3>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-cream-300">
            {grievance.timeline?.map((step, idx) => (
              <div key={idx} className="relative">
                <span className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center text-[10px] ring-4 ring-brand-50">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>

                <div className="bg-cream-50/70 p-3.5 rounded-xl border border-cream-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-ink-900 capitalize">
                      {t(`status.${step.status}`)}
                    </span>
                    <span className="text-[11px] text-ink-400">
                      {step.at ? new Date(step.at).toLocaleDateString('en-GB') : ''}
                    </span>
                  </div>
                  <p className="text-xs text-ink-700 leading-relaxed">
                    {step.note || step.comment || 'Status updated.'}
                  </p>
                  {step.photo && (
                    <div className="mt-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 block mb-1">
                        Officer Progress Photo:
                      </span>
                      <div className="w-28 h-20 rounded-lg overflow-hidden border border-cream-300 shadow-2xs">
                        <img src={step.photo} alt="Officer action photo" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}
                  {step.by && (
                    <span className="text-[10px] font-semibold text-ink-400 mt-1 block">
                      By: {step.by}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ================= STEP B2: CITIZEN FEEDBACK & REOPEN SECTION ================= */}
        {feedbackSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackSuccess}</span>
          </div>
        )}

        {grievance.status === 'resolved' && (
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/80 via-white to-amber-50/40 border border-amber-200/80 space-y-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 mb-2">
                Action Completed by Officer
              </span>
              <h4 className="font-display font-bold text-sm text-ink-900">
                {lang === 'mr' ? 'तक्रार निवारण अभिप्राय व समाधान' : 'Resolution Feedback & Confirmation'}
              </h4>
              <p className="text-xs text-ink-600 mt-0.5">
                {lang === 'mr'
                  ? 'अधिकारी द्वारे केलेल्या निवारणावर आपले समाधान झाले आहे का? कृपया रेटिंग द्या किंवा असमाधानकारक असल्यास तक्रार पुन्हा उघडा.'
                  : 'Are you satisfied with the resolution provided? Please rate the service to close the ticket or reopen if the issue persists.'}
              </p>
            </div>

            {/* Rating Stars */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-ink-700 block">
                {lang === 'mr' ? 'निवारण गुणवत्ता रेटिंग (1-5 तारे)' : 'Rate Resolution Quality (1-5 Stars)'}
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setSelectedRating(star)}
                    className="cursor-pointer transition transform hover:scale-110 p-1"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= selectedRating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-cream-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-amber-800 ml-2">
                  {selectedRating} / 5 Stars
                </span>
              </div>

              <input
                type="text"
                value={ratingFeedback}
                onChange={(e) => setRatingFeedback(e.target.value)}
                placeholder={
                  lang === 'mr'
                    ? 'अतिरिक्त अभिप्राय नोंदवा (पर्यायी)...'
                    : 'Optional resolution remarks or feedback...'
                }
                className="w-full px-3 py-2 rounded-xl border border-cream-300 bg-white text-xs text-ink-900"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-amber-200/60">
              <button
                type="button"
                onClick={() => setShowReopenBox(!showReopenBox)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-orange-300 bg-white hover:bg-orange-50 text-orange-700 text-xs font-semibold cursor-pointer transition shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>
                  {showReopenBox
                    ? (lang === 'mr' ? 'रद्द करा' : 'Cancel')
                    : (lang === 'mr' ? 'समाधान झाले नाही - तक्रार पुन्हा उघडा' : 'Not Resolved - Reopen')}
                </span>
              </button>

              <button
                type="button"
                onClick={handleRateResolution}
                disabled={submittingRating}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-brand cursor-pointer transition"
              >
                <Check className="w-3.5 h-3.5" />
                <span>
                  {submittingRating
                    ? (lang === 'mr' ? 'नोंदवत आहे...' : 'Submitting...')
                    : (lang === 'mr' ? 'अभिप्राय सबमिट करा व तक्रार बंद करा' : 'Submit & Close Complaint')}
                </span>
              </button>
            </div>

            {/* Reopen Box */}
            {showReopenBox && (
              <div className="p-3.5 rounded-xl bg-orange-50/80 border border-orange-200 space-y-2 mt-3">
                <label className="text-xs font-bold text-orange-950 block">
                  {lang === 'mr' ? 'तक्रार पुन्हा उघडण्याचे कारण' : 'Reason for Reopening Complaint'}
                </label>
                <textarea
                  rows={2}
                  value={reopenReason}
                  onChange={(e) => setReopenReason(e.target.value)}
                  placeholder={
                    lang === 'mr'
                      ? 'समस्या अद्याप का सुटलेली नाही याचे कारण लिहा...'
                      : 'Explain why the resolution was incomplete or ineffective...'
                  }
                  className="w-full p-2.5 rounded-xl border border-orange-200 bg-white text-xs text-ink-900"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleReopenComplaint}
                    disabled={submittingReopen || !reopenReason.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-xs font-semibold cursor-pointer transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>
                      {submittingReopen
                        ? (lang === 'mr' ? 'सादर करत आहे...' : 'Reopening...')
                        : (lang === 'mr' ? 'पुन्हा उघडा (Confirm Reopen)' : 'Confirm Reopen')}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {grievance.status === 'closed' && (
          <div className="p-4 rounded-2xl bg-cream-100 border border-cream-200 text-xs text-ink-700 flex items-center justify-between">
            <div>
              <span className="font-bold text-ink-900 block">Complaint Closed</span>
              <span>This grievance has been completed and verified with citizen rating.</span>
            </div>
            {grievance.rating && (
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{grievance.rating} / 5</span>
              </div>
            )}
          </div>
        )}

        {grievance.status === 'reopened' && (
          <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 text-xs text-orange-800 flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-orange-600 shrink-0" />
            <span>
              <strong>Complaint Reopened:</strong> Field officer re-investigation is currently pending.
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
