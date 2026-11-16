import { STATUS, PRIORITY_META, INPUT_MODES } from '../utils/constants'
import { categories, divisions, officers } from './mockMaster'
import { users } from './mockUsers'

// ================= TIME HELPERS =================
const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR
const now = Date.now()
const iso = (ms) => new Date(ms).toISOString()
const daysAgo = (d) => now - d * DAY

// ================= SEEDED RANDOM (same data every time) =================
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rand = mulberry32(2026)
const pick = (arr) => arr[Math.floor(rand() * arr.length)]
const between = (min, max) => min + rand() * (max - min)
const jitter = (v) => +(v + (rand() - 0.5) * 0.012).toFixed(6)

// ================= LOOKUPS =================
const allAreas = divisions.flatMap((d) => d.areas.map((a) => ({ ...a, divisionId: d.id })))
const findArea = (id) => allAreas.find((a) => a.id === id)
const findCategory = (id) => categories.find((c) => c.id === id)
const officerFor = (deptId, divId) =>
  officers.find((o) => o.departmentId === deptId && o.divisionId === divId) ||
  officers.find((o) => o.departmentId === deptId)

const rahul = users.find((u) => u.id === 'USR-C001')
const publicCitizens = [
  ...users.filter((u) => u.role === 'citizen' && u.id !== 'USR-C001'),
  { id: 'USR-P01', name: 'Amit Kale', mobile: '9820145501' },
  { id: 'USR-P02', name: 'Pooja Naik', mobile: '9820145502' },
  { id: 'USR-P03', name: 'Ganesh Sawant', mobile: '9820145503' },
  { id: 'USR-P04', name: 'Farhan Qureshi', mobile: '9820145504' },
  { id: 'USR-P05', name: 'Deepali Chavan', mobile: '9820145505' },
  { id: 'USR-P06', name: 'Mahesh Thakur', mobile: '9820145506' },
  { id: 'USR-P07', name: 'Swati Bhosale', mobile: '9820145507' },
  { id: 'USR-P08', name: 'Kiran Mhatre', mobile: '9820145508' },
]

// ================= TIMELINE BUILDER =================
const FLOW = [
  STATUS.RECEIVED,
  STATUS.ASSIGNED,
  STATUS.WORK_STARTED,
  STATUS.IN_PROGRESS,
  STATUS.RESOLVED,
  STATUS.CLOSED,
]

const GAP_HOURS = {
  assigned: [2, 8],
  work_started: [12, 48],
  in_progress: [12, 36],
  resolved: [24, 72],
  closed: [12, 36],
}

function stepNote(status, officer, category) {
  switch (status) {
    case STATUS.RECEIVED:
      return `Complaint registered. AI classified it as "${category.name}".`
    case STATUS.ASSIGNED:
      return officer ? `Assigned to ${officer.name} (${officer.designation}).` : 'Assigned to department.'
    case STATUS.WORK_STARTED:
      return 'Site inspected. Work has started on the complaint.'
    case STATUS.IN_PROGRESS:
      return 'Work in progress. Progress photo uploaded by officer.'
    case STATUS.RESOLVED:
      return 'Issue resolved. Resolution photo uploaded.'
    case STATUS.CLOSED:
      return 'Complaint closed after citizen confirmation.'
    default:
      return ''
  }
}

function stepBy(status, officer) {
  if (status === STATUS.RECEIVED) return 'AI System'
  if (status === STATUS.ASSIGNED || status === STATUS.CLOSED) return 'Admin'
  return officer?.name || 'Department'
}

function buildTimeline(status, createdAt, officer, category, slaHours) {
  const lastIndex =
    status === STATUS.ACTION_NOT_TAKEN ? FLOW.indexOf(STATUS.ASSIGNED) : FLOW.indexOf(status)

  const steps = []
  let t = createdAt

  for (let i = 0; i <= lastIndex; i++) {
    const s = FLOW[i]
    if (i > 0) {
      const [min, max] = GAP_HOURS[s]
      const next = t + between(min, max) * HOUR
      const latestAllowed = now - (lastIndex - i + 1) * HOUR
      t = Math.max(t + 0.25 * HOUR, Math.min(next, latestAllowed))
    }
    steps.push({ status: s, at: iso(t), note: stepNote(s, officer, category), by: stepBy(s, officer), photo: null })
  }

  if (status === STATUS.ACTION_NOT_TAKEN) {
    steps.push({
      status: STATUS.ACTION_NOT_TAKEN,
      at: iso(Math.min(createdAt + slaHours * HOUR, now - HOUR)),
      note: 'SLA breached. No action recorded by department. Escalated to admin.',
      by: 'System',
      photo: null,
    })
  }
  return steps
}

// ================= GRIEVANCE BUILDER =================
function createGrievance({
  id,
  citizen,
  categoryId,
  areaId,
  title,
  description,
  createdAt,
  status,
  priority,
  inputMode = INPUT_MODES.TEXT,
  language = 'en',
  clusterId = null,
  address,
}) {
  const category = findCategory(categoryId)
  const area = findArea(areaId)
  const officer = officerFor(category.departments[0], area.divisionId)
  const prio = priority || category.defaultPriority
  const slaHours = PRIORITY_META[prio].slaHours
  const timeline = buildTimeline(status, createdAt, officer, category, slaHours)
  const resolvedStep = timeline.find((t) => t.status === STATUS.RESOLVED)

  return {
    id,
    title,
    description,
    inputMode,
    language,
    categoryId,
    departmentIds: category.departments, // [primary, ...supporting]
    divisionId: area.divisionId,
    areaId,
    location: {
      lat: jitter(area.lat),
      lng: jitter(area.lng),
      address: address || area.name,
      source: inputMode === INPUT_MODES.PHOTO ? 'photo' : 'gps',
    },
    photos: [],
    priority: prio,
    status,
    citizenId: citizen.id,
    citizenName: citizen.name,
    citizenMobile: citizen.mobile,
    assignedOfficerId: status === STATUS.RECEIVED ? null : officer?.id || null,
    aiConfidence: +between(0.78, 0.98).toFixed(2),
    clusterId,
    createdAt: iso(createdAt),
    dueAt: iso(createdAt + slaHours * HOUR),
    resolvedAt: resolvedStep ? resolvedStep.at : null,
    timeline,
    feedback:
      status === STATUS.CLOSED
        ? { rating: 3 + Math.floor(rand() * 3), comment: 'Issue resolved properly. Thank you.' }
        : null,
  }
}

// ================= 1. RAHUL'S GRIEVANCES (citizen demo) =================
const rahulGrievances = [
  createGrievance({
    id: 'MIDC-1025', citizen: rahul, categoryId: 'CAT-STL', areaId: 'AR-AND',
    title: 'Streetlight not working in Phase II',
    description: 'Three streetlights on the main road of Phase II have not been working for a week. The area is very dark at night and unsafe for workers.',
    createdAt: daysAgo(0.4), status: STATUS.RECEIVED,
    address: 'Phase II Main Road, Andheri MIDC',
  }),
  createGrievance({
    id: 'MIDC-1024', citizen: rahul, categoryId: 'CAT-POT', areaId: 'AR-AND',
    title: 'Road damage near Industrial Gate',
    description: 'Large potholes near the Industrial Gate are causing traffic jams and damage to trucks.',
    createdAt: daysAgo(3), status: STATUS.WORK_STARTED, inputMode: INPUT_MODES.PHOTO,
    address: 'Near Industrial Gate, Andheri MIDC',
  }),
  createGrievance({
    id: 'MIDC-1026', citizen: rahul, categoryId: 'CAT-DRN', areaId: 'AR-AND',
    title: 'गटार तुंबल्यामुळे रस्त्यावर पाणी',
    description: 'प्लॉट C-20 जवळील गटार तुंबले असून घाण पाणी रस्त्यावर वाहत आहे.',
    createdAt: daysAgo(6), status: STATUS.IN_PROGRESS, inputMode: INPUT_MODES.VOICE, language: 'mr',
    address: 'Near Plot C-20, Andheri MIDC',
  }),
  createGrievance({
    id: 'MIDC-1023', citizen: rahul, categoryId: 'CAT-WLK', areaId: 'AR-AND',
    title: 'Water leakage near Drainage Line',
    description: 'Continuous water leakage from the pipeline near the drainage line. Water is being wasted.',
    createdAt: daysAgo(20), status: STATUS.RESOLVED,
    address: 'Drainage Line Road, Andheri MIDC',
  }),
  createGrievance({
    id: 'MIDC-1022', citizen: rahul, categoryId: 'CAT-GAR', areaId: 'AR-AND',
    title: 'Garbage dumped near bus stop',
    description: 'Garbage has been dumped near the MIDC bus stop for several days.',
    createdAt: daysAgo(40), status: STATUS.CLOSED,
    address: 'MIDC Bus Stop, Andheri MIDC',
  }),
]

// ================= 2. DUPLICATE CLUSTERS =================
const clusterGrievances = [
  // Cluster 1: 5 streetlight complaints on the same road
  ...[0, 1, 2, 3, 4].map((i) =>
    createGrievance({
      id: `MIDC-490${i + 1}`, citizen: publicCitizens[i], categoryId: 'CAT-STL', areaId: 'AR-AND',
      title: 'Streetlights off on Road No. 16',
      description: 'Streetlights on Road No. 16 are not working at night.',
      createdAt: daysAgo(2 + i * 0.3), status: STATUS.ASSIGNED,
      clusterId: 'CL-001', address: 'Road No. 16, Andheri MIDC',
    })
  ),
  // Cluster 2: 3 drainage complaints in Taloja
  ...[0, 1, 2].map((i) =>
    createGrievance({
      id: `MIDC-491${i + 1}`, citizen: publicCitizens[i + 5], categoryId: 'CAT-DRN', areaId: 'AR-TAL',
      title: 'Drain overflowing near Sector 3',
      description: 'Drain near Sector 3 is overflowing onto the road.',
      createdAt: daysAgo(4 + i * 0.5), status: STATUS.WORK_STARTED,
      clusterId: 'CL-002', address: 'Sector 3, Taloja MIDC',
    })
  ),
]

// ================= 3. GENERATED ORG-WIDE GRIEVANCES =================
const TITLES = {
  'CAT-POT': ['Pothole near Gate {n}', 'Road damaged on Road No. {n}', 'Deep potholes near Plot {p}'],
  'CAT-STL': ['Streetlight not working near Plot {p}', 'Streetlights off on Road No. {n}'],
  'CAT-WLK': ['Water pipeline leakage near Plot {p}', 'Pipeline burst on Road No. {n}'],
  'CAT-NWS': ['No water supply to Plot {p}', 'Low water pressure in Sector {n}'],
  'CAT-DRN': ['Drainage blocked near Plot {p}', 'Sewer overflow on Road No. {n}'],
  'CAT-GAR': ['Garbage dumping near Plot {p}', 'Waste not collected in Sector {n}'],
  'CAT-POL': ['Chemical smell near Plot {p}', 'Black smoke from unit in Sector {n}'],
  'CAT-FIR': ['Gas leakage risk near Plot {p}', 'Fire hazard near Sector {n} godown'],
  'CAT-TRE': ['Tree fallen on Road No. {n}', 'Large branch blocking road near Plot {p}'],
  'CAT-ENC': ['Encroachment on open plot {p}', 'Illegal stalls on Road No. {n}'],
}

const DESCRIPTIONS = {
  'CAT-POT': 'Potholes are causing accidents and vehicle damage. Needs urgent repair.',
  'CAT-STL': 'Streetlights are not working, making the road unsafe at night.',
  'CAT-WLK': 'Continuous water leakage from the pipeline. Large amount of water wasted.',
  'CAT-NWS': 'Industrial units are not getting proper water supply for the last few days.',
  'CAT-DRN': 'Drain is blocked and dirty water is flowing on the road.',
  'CAT-GAR': 'Garbage is lying on the roadside and causing foul smell.',
  'CAT-POL': 'Strong chemical smell and smoke affecting nearby workers.',
  'CAT-FIR': 'Possible fire hazard. Immediate inspection required.',
  'CAT-TRE': 'Fallen tree is blocking traffic movement.',
  'CAT-ENC': 'Unauthorised occupation of MIDC land.',
}

function fillTitle(template) {
  const n = 1 + Math.floor(rand() * 20)
  const p = `${pick(['A', 'B', 'C', 'D', 'W', 'T'])}-${1 + Math.floor(rand() * 90)}`
  return template.replace('{n}', n).replace('{p}', p)
}

function statusForAge(age) {
  const r = rand()
  if (age < 1) return STATUS.RECEIVED
  if (age < 3) return r < 0.5 ? STATUS.ASSIGNED : STATUS.WORK_STARTED
  if (age < 10) {
    if (r < 0.15) return STATUS.ACTION_NOT_TAKEN
    if (r < 0.45) return STATUS.IN_PROGRESS
    if (r < 0.7) return STATUS.WORK_STARTED
    return STATUS.RESOLVED
  }
  if (r < 0.08) return STATUS.ACTION_NOT_TAKEN
  if (r < 0.2) return STATUS.IN_PROGRESS
  if (r < 0.6) return STATUS.RESOLVED
  return STATUS.CLOSED
}

const GENERATED_COUNT = 160

const generatedGrievances = Array.from({ length: GENERATED_COUNT }, (_, i) => {
  const category = pick(categories)
  const area = pick(allAreas)
  const age = 180 * Math.pow(rand(), 1.3) // more complaints in recent months
  const priority = rand() < 0.15 ? 'high' : category.defaultPriority
  const inputMode = pick([INPUT_MODES.TEXT, INPUT_MODES.TEXT, INPUT_MODES.VOICE, INPUT_MODES.PHOTO])

  return createGrievance({
    id: `MIDC-${5001 + i}`,
    citizen: pick(publicCitizens),
    categoryId: category.id,
    areaId: area.id,
    title: fillTitle(pick(TITLES[category.id])),
    description: DESCRIPTIONS[category.id],
    createdAt: daysAgo(age),
    status: statusForAge(age),
    priority,
    inputMode,
    language: rand() < 0.35 ? 'mr' : 'en',
  })
})

// ================= EXPORT (newest first) =================
export const grievances = [...rahulGrievances, ...clusterGrievances, ...generatedGrievances].sort(
  (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
)