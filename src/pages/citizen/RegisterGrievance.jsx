import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import {
  Sparkles,
  MapPin,
  Upload,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Building2,
  Layers,
  FileText,
  Clock,
  Camera,
  Type,
  Mic,
  ChevronRight,
  ShieldCheck,
  Check,
  Tag,
} from 'lucide-react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { api } from '../../services/api'
import { PRIORITY, PRIORITY_META, INPUT_MODES } from '../../utils/constants'
import VoiceRecorder from '../../components/common/VoiceRecorder'
import exifr from 'exifr'

// Leaflet default pin fix
const customPin = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// Sub-component to capture map click and update lat/lng
function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng])
    },
  })

  return position ? <Marker position={position} icon={customPin} /> : null
}

export default function RegisterGrievance() {
  const { user } = useAuth()
  const { t, lang } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()

  // Steps: 1: Describe, 2: AI Draft & Classification, 3: Location Pin, 4: Review & Submit, 5: Success Ticket
  const [currentStep, setCurrentStep] = useState(1)

  // Master data
  const [divisions, setDivisions] = useState([])
  const [categories, setCategories] = useState([])
  const [departments, setDepartments] = useState([])
  const [units, setUnits] = useState([])
  const [selectedUnit, setSelectedUnit] = useState('')
  const [loadingMaster, setLoadingMaster] = useState(true)

  // Form states
  const [inputMode, setInputMode] = useState(location.state?.initialMode || 'type')
  const [rawText, setRawText] = useState(location.state?.initialText || '')
  const [photoPreview, setPhotoPreview] = useState(null)

  // AI draft states
  const [aiAnalyzing, setAiAnalyzing] = useState(false)
  const [draftTitle, setDraftTitle] = useState('')
  const [draftDescription, setDraftDescription] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [routedDepts, setRoutedDepts] = useState([])
  const [selectedDivision, setSelectedDivision] = useState('DIV-MUM')
  const [selectedArea, setSelectedArea] = useState('AR-AND')
  const [selectedPriority, setSelectedPriority] = useState(PRIORITY.MEDIUM)
  const [aiConfidence, setAiConfidence] = useState(0.92)

  // Location pin
  const [mapPos, setMapPos] = useState([19.1176, 72.8697]) // Default: Andheri MIDC
  const [streetAddress, setStreetAddress] = useState('Near MIDC Central Road, Andheri East')
  const [gpsDetected, setGpsDetected] = useState(false)
  const [aiReasons, setAiReasons] = useState([])

  // Submission result
  const [submitting, setSubmitting] = useState(false)
  const [createdTicket, setCreatedTicket] = useState(null)
  const [duplicatesFound, setDuplicatesFound] = useState([])
  const [checkingDuplicates, setCheckingDuplicates] = useState(false)

  useEffect(() => {
    async function loadMaster() {
      try {
        const [divs, cats, depts] = await Promise.all([
          api.getDivisions(),
          api.getCategories(),
          api.getDepartments(),
        ])
        setDivisions(divs)
        setCategories(cats)
        setDepartments(depts)
      } catch (e) {
        console.error(e)
      } finally {
        setLoadingMaster(false)
      }
    }
    loadMaster()
  }, [])

  // When area changes, pan map & load matching industrial units
  useEffect(() => {
    const curDiv = divisions.find((d) => d.id === selectedDivision)
    const area = curDiv?.areas?.find((a) => a.id === selectedArea)
    if (area?.lat && area?.lng) {
      setMapPos([area.lat, area.lng])
      setStreetAddress(`${area.name}, Industrial Estate`)
    }
    // Load area units
    api.getIndustrialUnits(selectedArea).then((unitList) => {
      setUnits(unitList)
      setSelectedUnit('')
    })
  }, [selectedArea, selectedDivision, divisions])

  // Step 1 -> 2: Trigger Realistic AI Categorization
  const handleAnalyzeWithAI = async () => {
    if (!rawText.trim() && !photoPreview) return
    setAiAnalyzing(true)

    try {
      const result = await api.aiAnalyze({ text: rawText, lang })
      setSelectedCategory(result.categoryId)
      setSelectedPriority(result.priority)
      setDraftTitle(result.draftTitle)
      setDraftDescription(result.draftDescription)
      setAiConfidence(result.confidence)
      setAiReasons(result.reasons || [])
      setRoutedDepts(result.departments || [])
      setCurrentStep(2)
    } catch (err) {
      console.error('AI analysis error:', err)
      setCurrentStep(2)
    } finally {
      setAiAnalyzing(false)
    }
  }

  // Handle Photo Upload with EXIF GPS parsing
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPhotoPreview(url)
      if (!rawText) {
        setRawText(
          lang === 'mr'
            ? 'अपलोड केलेल्या फोटोप्रमाणे समस्येची तक्रार नोंदवली आहे.'
            : 'Reported issue as captured in the attached photo.'
        )
      }

      // Try reading GPS coordinates from EXIF metadata
      try {
        const gps = await exifr.gps(file)
        if (gps && typeof gps.latitude === 'number' && typeof gps.longitude === 'number') {
          setMapPos([gps.latitude, gps.longitude])
          setStreetAddress(
            lang === 'mr'
              ? `फोटोमधील जीपीएस स्थान (${gps.latitude.toFixed(4)}, ${gps.longitude.toFixed(4)})`
              : `Location detected from photo coordinates (${gps.latitude.toFixed(4)}, ${gps.longitude.toFixed(4)})`
          )
          setGpsDetected(true)
        }
      } catch (exifErr) {
        console.warn('EXIF GPS not found or not supported in this image:', exifErr)
      }
    }
  }

  // Submit Final Complaint
  const handleSubmitGrievance = async () => {
    setSubmitting(true)
    try {
      const catObj = categories.find((c) => c.id === selectedCategory)
      const primaryDept = catObj?.departments?.[0] || 'DEP-ENG'

      const ticket = await api.createGrievance({
        title: draftTitle,
        description: draftDescription,
        categoryId: selectedCategory,
        divisionId: selectedDivision,
        areaId: selectedArea,
        priority: selectedPriority,
        inputMode,
        industrialUnit: selectedUnit ? units.find((u) => u.id === selectedUnit)?.name || '' : '',
        unitId: selectedUnit || '',
        departmentIds: catObj?.departments || [primaryDept],
        location: {
          lat: mapPos[0],
          lng: mapPos[1],
          address: streetAddress,
        },
        photos: photoPreview ? [photoPreview] : [],
        citizen: {
          id: user?.id || 'USR-C001',
          name: user?.name || 'Rahul Deshmukh',
          mobile: user?.mobile || '9876543210',
        },
      })

      setCreatedTicket(ticket)
      setCurrentStep(5) // Success Step
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const stepsList = [
    { num: 1, label: lang === 'mr' ? 'तक्रार वर्णन' : 'Describe Issue' },
    { num: 2, label: lang === 'mr' ? 'एआय विश्लेषण' : 'AI Routing' },
    { num: 3, label: lang === 'mr' ? 'स्थान निवडा' : 'Map Location' },
    { num: 4, label: lang === 'mr' ? 'पुनरावलोकन' : 'Review & Submit' },
  ]

  const catObj = categories.find((c) => c.id === selectedCategory)
  const primaryDeptObj = departments.find((d) => d.id === catObj?.departments?.[0])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Breadcrumb & Title */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-ink-400 mb-1 flex items-center gap-1.5">
            <Link to="/citizen" className="hover:text-brand-700">
              {t('nav.dashboard')}
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-brand-700 font-semibold">{t('nav.registerGrievance')}</span>
          </div>
          <h1 className="font-display font-bold text-2xl lg:text-3xl text-ink-900 tracking-tight">
            {t('nav.registerGrievance')}
          </h1>
        </div>

        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>AI Assisted Flow</span>
        </span>
      </div>

      {/* Stepper Progress Header */}
      {currentStep <= 4 && (
        <div className="bg-white rounded-2xl p-4 border border-cream-200/90 shadow-card">
          <div className="grid grid-cols-4 gap-2">
            {stepsList.map((step) => {
              const isPast = currentStep > step.num
              const isCurrent = currentStep === step.num
              return (
                <div
                  key={step.num}
                  className={`flex items-center gap-2 p-2 rounded-xl transition ${isCurrent
                      ? 'bg-brand-50 border border-brand-200 text-brand-900 font-semibold'
                      : isPast
                        ? 'text-emerald-700'
                        : 'text-ink-400'
                    }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isCurrent
                        ? 'bg-brand-600 text-white'
                        : isPast
                          ? 'bg-emerald-600 text-white'
                          : 'bg-cream-200 text-ink-500'
                      }`}
                  >
                    {isPast ? <Check className="w-3.5 h-3.5" /> : step.num}
                  </div>
                  <span className="text-xs truncate hidden sm:inline">{step.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ================= STEP 1: DESCRIBE THE COMPLAINT ================= */}
      {currentStep === 1 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200/90 shadow-card space-y-6">
          <div>
            <h2 className="font-display font-bold text-lg text-ink-900 mb-1">
              {lang === 'mr' ? '१. समस्येचे वर्णन करा' : '1. Describe the Issue'}
            </h2>
            <p className="text-xs sm:text-sm text-ink-500">
              {lang === 'mr'
                ? 'खालील बॉक्समध्ये आपली समस्या लिहा किंवा छायाचित्र जोडा. आमचे एआय योग्य विभाग आणि प्रवर्ग ठरवेल.'
                : 'Enter your complaint details or upload a photo. Our AI will analyze keywords and suggest the right department.'}
            </p>
          </div>

          {/* Mode Switcher: Type, Speak, or Photo */}
          <div className="grid grid-cols-3 gap-3 max-w-lg">
            <button
              type="button"
              onClick={() => setInputMode('type')}
              className={`p-3 rounded-xl border text-center transition flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer ${inputMode === 'type'
                  ? 'border-brand-500 bg-brand-50 text-brand-800'
                  : 'border-cream-200 text-ink-600 hover:bg-cream-50'
                }`}
            >
              <Type className="w-4 h-4 text-brand-600" />
              <span>{t('dashboard.modeType')}</span>
            </button>

            <button
              type="button"
              onClick={() => setInputMode('voice')}
              className={`p-3 rounded-xl border text-center transition flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer ${inputMode === 'voice' || inputMode === 'speak'
                  ? 'border-brand-500 bg-brand-50 text-brand-800'
                  : 'border-cream-200 text-ink-600 hover:bg-cream-50'
                }`}
            >
              <Mic className="w-4 h-4 text-brand-600" />
              <span>{t('voice.speak') || t('dashboard.modeSpeak')}</span>
            </button>

            <button
              type="button"
              onClick={() => setInputMode('photo')}
              className={`p-3 rounded-xl border text-center transition flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer ${inputMode === 'photo'
                  ? 'border-brand-500 bg-brand-50 text-brand-800'
                  : 'border-cream-200 text-ink-600 hover:bg-cream-50'
                }`}
            >
              <Camera className="w-4 h-4 text-brand-600" />
              <span>{t('dashboard.modePhoto')}</span>
            </button>
          </div>

          {/* Description Input or Voice Recorder */}
          {inputMode === 'voice' || inputMode === 'speak' ? (
            <div className="space-y-2">
              <label className="text-xs font-bold text-ink-700 uppercase tracking-wider block">
                {lang === 'mr' ? 'आवाजाद्वारे तक्रार नोंदवा' : 'Voice Complaint Recording'}
              </label>
              <VoiceRecorder
                value={rawText}
                onChange={setRawText}
                rows={4}
                placeholder={
                  lang === 'mr'
                    ? 'माइक बटण दाबून बोला किंवा येथे टाइप करा...'
                    : 'Tap the mic to speak or edit your transcript here...'
                }
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-bold text-ink-700 uppercase tracking-wider block">
                {lang === 'mr' ? 'तक्रारीचा मजकूर' : 'Complaint Details'}
              </label>
              <textarea
                rows={4}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder={
                  lang === 'mr'
                    ? 'उदा. अंधेरी एमआयडीसी फेज २ मधील मुख्य रस्त्यावर पथदिवे बंद आहेत...'
                    : 'e.g. Streetlights are not working on the main road in Phase II near Plot C-24...'
                }
                className="w-full p-4 rounded-2xl border border-cream-300 bg-cream-50/40 text-ink-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
              />
            </div>
          )}

          {/* Photo Upload Box */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-ink-700 uppercase tracking-wider block">
              {lang === 'mr' ? 'छायाचित्र जोडा (ऐच्छिक)' : 'Attach Photograph (Optional)'}
            </label>
            <div className="flex items-center gap-4">
              <label className="px-4 py-2.5 rounded-xl border border-dashed border-cream-300 hover:border-brand-500 bg-cream-50/60 text-xs font-medium text-ink-700 flex items-center gap-2 cursor-pointer transition">
                <Upload className="w-4 h-4 text-brand-600" />
                <span>Upload from Device</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>

              {photoPreview && (
                <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-cream-300">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Next Button */}
          <div className="pt-4 border-t border-cream-200 flex justify-end">
            <button
              onClick={handleAnalyzeWithAI}
              disabled={aiAnalyzing || (!rawText.trim() && !photoPreview)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-medium text-sm transition shadow-brand cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {aiAnalyzing
                  ? lang === 'mr'
                    ? 'एआय विश्लेषण करत आहे...'
                    : 'AI Analyzing...'
                  : lang === 'mr'
                    ? 'एआय विश्लेषणासह पुढे जा'
                    : 'Continue with AI Analysis'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 2: AI DRAFT & DEPARTMENT ROUTING ================= */}
      {currentStep === 2 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200/90 shadow-card space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display font-bold text-lg text-ink-900 mb-1">
                {lang === 'mr' ? '२. एआय वर्गीकरण व मसुदा' : '2. AI Classification & Routing'}
              </h2>
              <p className="text-xs sm:text-sm text-ink-500">
                {lang === 'mr'
                  ? 'एआय ने आपल्या तक्रारीचे वर्गीकरण करून योग्य विभाग निवडला आहे. आपण यामध्ये बदल करू शकता.'
                  : 'AI has classified your grievance and suggested the primary handling department.'}
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {(aiConfidence * 100).toFixed(0)}% AI Match
            </span>
          </div>

          {/* AI Reasoning Insights */}
          {aiReasons.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-brand-50/60 border border-brand-200/60">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-800 block mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                {lang === 'mr' ? 'एआय विश्लेषण कारणे' : 'AI Analysis Reasons'}
              </span>
              <ul className="space-y-1">
                {aiReasons.map((reason, idx) => (
                  <li key={idx} className="text-xs text-ink-700 flex items-start gap-1.5">
                    <span className="text-brand-500 font-bold">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Title Draft */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-ink-700 uppercase tracking-wider block">
              {lang === 'mr' ? 'तक्रार शीर्षक (एआय मसुदा)' : 'Complaint Title (AI Draft)'}
            </label>
            <input
              type="text"
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-cream-300 bg-cream-50/40 text-ink-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          {/* Category & Suggested Department Card */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/70 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                {lang === 'mr' ? 'एआय शिफारस केलेला विभाग' : 'AI Suggested Department'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-ink-500 block mb-1">
                  {lang === 'mr' ? 'तक्रार प्रवर्ग' : 'Grievance Category'}
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-cream-300 bg-white text-xs font-semibold text-ink-900"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {lang === 'mr' ? cat.nameMr : cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-ink-500 block mb-1">
                  {lang === 'mr' ? 'नियुक्त विभाग (एआय शिफारस)' : 'Assigned Department(s)'}
                </label>
                <div className="p-2 rounded-lg bg-white border border-cream-200 text-xs font-bold text-brand-700 flex flex-wrap items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-brand-600 shrink-0" />
                  {routedDepts.length > 0 ? (
                    routedDepts.map((dId) => {
                      const dObj = departments.find((d) => d.id === dId)
                      return (
                        <span
                          key={dId}
                          className="px-2 py-0.5 rounded-md bg-brand-50 text-brand-800 border border-brand-200/80 font-semibold text-[11px]"
                        >
                          {dObj ? (lang === 'mr' && dObj.nameMr ? dObj.nameMr : dObj.name) : dId}
                        </span>
                      )
                    })
                  ) : (
                    <span>
                      {primaryDeptObj
                        ? lang === 'mr'
                          ? primaryDeptObj.nameMr
                          : primaryDeptObj.name
                        : 'Engineering'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Priority Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-ink-700 uppercase tracking-wider block">
              {lang === 'mr' ? 'प्राधान्यता' : 'Priority Level'}
            </label>
            <div className="grid grid-cols-3 gap-3 max-w-md">
              {['low', 'medium', 'high'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setSelectedPriority(p)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold capitalize transition cursor-pointer ${selectedPriority === p
                      ? 'border-brand-600 bg-brand-50 text-brand-800'
                      : 'border-cream-200 text-ink-600 hover:bg-cream-50'
                    }`}
                >
                  {t(`priority.${p}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-cream-200 flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-ink-600 hover:text-ink-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm transition shadow-brand cursor-pointer"
            >
              <span>Next: Map Location</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 3: LOCATION PIN ================= */}
      {currentStep === 3 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200/90 shadow-card space-y-6">
          <div>
            <h2 className="font-display font-bold text-lg text-ink-900 mb-1">
              {lang === 'mr' ? '३. तक्रारीचे अचूक स्थान' : '3. Location & Industrial Area'}
            </h2>
            <p className="text-xs sm:text-sm text-ink-500">
              {lang === 'mr'
                ? 'नकाशावर क्लिक करून तक्रारीचे अचूक स्थान पिन करा.'
                : 'Click on the map or select industrial area to pinpoint the exact location.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-ink-500 block mb-1">
                {lang === 'mr' ? 'विभाग' : 'Division'}
              </label>
              <select
                value={selectedDivision}
                onChange={(e) => {
                  setSelectedDivision(e.target.value)
                  const div = divisions.find((d) => d.id === e.target.value)
                  if (div?.areas?.[0]) {
                    setSelectedArea(div.areas[0].id)
                  }
                }}
                className="w-full px-3 py-2 rounded-xl border border-cream-300 bg-white text-xs font-semibold text-ink-900"
              >
                {divisions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {lang === 'mr' ? d.nameMr : d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-ink-500 block mb-1">
                {lang === 'mr' ? 'औद्योगिक क्षेत्र' : 'Industrial Area'}
              </label>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-cream-300 bg-white text-xs font-semibold text-ink-900"
              >
                {divisions
                  .find((d) => d.id === selectedDivision)
                  ?.areas?.map((a) => (
                    <option key={a.id} value={a.id}>
                      {lang === 'mr' ? a.nameMr : a.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Optional Industrial Unit / Company Field */}
          <div className="p-3.5 rounded-2xl bg-cream-50/60 border border-cream-200">
            <label className="text-xs font-bold text-ink-700 block mb-1 flex items-center justify-between">
              <span>
                {lang === 'mr' ? 'विशिष्ट कंपनी किंवा औद्योगिक युनिट (पर्यायी)' : 'Complaint Against Specific Industrial Unit / Company (Optional)'}
              </span>
              <span className="text-[10px] font-normal text-ink-400">Pollution, hazardous emission or encroachment</span>
            </label>
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-cream-300 bg-white text-xs font-semibold text-ink-900"
            >
              <option value="">
                {lang === 'mr' ? '— सामान्य तक्रार / कोणतीही कंपनी निर्दिष्ट नाही —' : '— General Grievance / No specific company —'}
              </option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.sector})
                </option>
              ))}
            </select>
          </div>

          {/* GPS from Photo Notice */}
          {gpsDetected && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {lang === 'mr'
                  ? 'फोटोमधून जीपीएस स्थान आपोआप शोधले गेले आहे. कृपया नकाशावर खात्री करा.'
                  : 'Location detected automatically from photo coordinates. Please confirm on the map.'}
              </span>
            </div>
          )}

          {/* Interactive Leaflet Map */}
          <div className="rounded-2xl overflow-hidden border border-cream-300 h-64 relative z-0 shadow-inner">
            <MapContainer
              center={mapPos}
              zoom={13}
              scrollWheelZoom={false}
              className="w-full h-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker position={mapPos} setPosition={setMapPos} />
            </MapContainer>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-ink-500 block">
              {lang === 'mr' ? 'स्थान तपशील / रस्ता पत्ता' : 'Street / Landmark Address'}
            </label>
            <input
              type="text"
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-cream-300 bg-cream-50/40 text-xs text-ink-900"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-cream-200 flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-ink-600 hover:text-ink-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={async () => {
                setCheckingDuplicates(true)
                try {
                  const dups = await api.checkDuplicates({
                    categoryId: selectedCategory,
                    lat: mapPos[0],
                    lng: mapPos[1],
                    radiusMeters: 200,
                  })
                  setDuplicatesFound(dups)
                } catch (e) {
                  console.error(e)
                } finally {
                  setCheckingDuplicates(false)
                  setCurrentStep(4)
                }
              }}
              disabled={checkingDuplicates}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm transition shadow-brand cursor-pointer"
            >
              <span>{checkingDuplicates ? 'Checking Proximity...' : 'Next: Final Review'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 4: REVIEW & SUBMIT ================= */}
      {currentStep === 4 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200/90 shadow-card space-y-6">
          <div>
            <h2 className="font-display font-bold text-lg text-ink-900 mb-1">
              {lang === 'mr' ? '४. माहितीची पडताळणी' : '4. Final Review & Submit'}
            </h2>
            <p className="text-xs sm:text-sm text-ink-500">
              {lang === 'mr'
                ? 'कृपया दाखल करण्यापूर्वी सर्व तपशील तपासून घ्या.'
                : 'Please verify the details before officially lodging the grievance.'}
            </p>
          </div>

          {/* Duplicate Warning Callout */}
          {duplicatesFound.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  {duplicatesFound.length} similar complaint{duplicatesFound.length > 1 ? 's' : ''} already reported nearby
                </span>
              </div>
              <p className="text-amber-700">
                AI detected active complaints within 200m in this category submitted recently. Your grievance will be linked to cluster{' '}
                <strong className="font-mono">{duplicatesFound[0].clusterId || 'New Cluster'}</strong> to escalate urgency and prevent duplicate dispatch.
              </p>
              <div className="pt-1 flex flex-wrap gap-2">
                {duplicatesFound.map((d) => (
                  <span
                    key={d.id}
                    className="px-2 py-0.5 rounded bg-white border border-amber-200 font-mono text-[11px] text-amber-800"
                  >
                    {d.id} ({d.title})
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="p-5 rounded-2xl bg-cream-50 border border-cream-200 space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between border-b border-cream-200 pb-2">
              <span className="text-ink-500">Title:</span>
              <span className="font-bold text-ink-900">{draftTitle}</span>
            </div>
            <div className="flex justify-between border-b border-cream-200 pb-2">
              <span className="text-ink-500">Department:</span>
              <span className="font-semibold text-brand-700">
                {primaryDeptObj?.name || 'Engineering'}
              </span>
            </div>
            <div className="flex justify-between border-b border-cream-200 pb-2">
              <span className="text-ink-500">Location:</span>
              <span className="text-ink-900">{streetAddress}</span>
            </div>
            {selectedUnit && (
              <div className="flex justify-between border-b border-cream-200 pb-2">
                <span className="text-ink-500">Industrial Unit:</span>
                <span className="font-semibold text-ink-900">
                  {units.find((u) => u.id === selectedUnit)?.name || selectedUnit}
                </span>
              </div>
            )}
            <div className="flex justify-between border-b border-cream-200 pb-2">
              <span className="text-ink-500">Priority:</span>
              <span className="font-bold uppercase text-amber-700">{selectedPriority}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-ink-500">Citizen:</span>
              <span className="text-ink-900 font-medium">
                {user?.name || 'Rahul Deshmukh'} ({user?.mobile || '9876543210'})
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-cream-200 flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(3)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-ink-600 hover:text-ink-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={handleSubmitGrievance}
              disabled={submitting}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm transition shadow-brand cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? 'Submitting Grievance...' : 'Submit Grievance'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 5: SUCCESS TICKET ================= */}
      {currentStep === 5 && createdTicket && (
        <div className="bg-white rounded-3xl p-8 border border-cream-200/90 shadow-raised text-center max-w-lg mx-auto space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h2 className="font-display font-extrabold text-2xl text-ink-900">
              Grievance Registered!
            </h2>
            <p className="text-xs text-ink-500 mt-1">
              Your grievance has been successfully logged with MIDC.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 font-mono text-center">
            <span className="text-xs text-ink-500 block mb-1">Tracking Ticket ID:</span>
            <span className="text-2xl font-extrabold text-brand-700 tracking-wider">
              {createdTicket.id}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              to={`/citizen/grievances/${createdTicket.id}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition shadow-brand"
            >
              <span>Track Ticket Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/citizen"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-cream-100 hover:bg-cream-200 text-ink-700 text-xs font-semibold transition"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
