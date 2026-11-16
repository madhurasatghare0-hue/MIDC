// ================= ROLES =================
export const ROLES = {
  CITIZEN: 'citizen',
  ADMIN: 'admin',
}

// ================= LANGUAGES =================
export const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
]

// ================= GRIEVANCE STATUS =================
// Order follows the complaint workflow
export const STATUS = {
  RECEIVED: 'received',
  ASSIGNED: 'assigned',
  WORK_STARTED: 'work_started',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  REOPENED: 'reopened',
  ACTION_NOT_TAKEN: 'action_not_taken',
}

export const STATUS_META = {
  received:         { label: 'Received',         dot: 'bg-status-received', badge: 'bg-cream-200 text-ink-700' },
  assigned:         { label: 'Assigned',         dot: 'bg-status-assigned', badge: 'bg-violet-50 text-violet-700' },
  work_started:     { label: 'Work Started',     dot: 'bg-status-pending',  badge: 'bg-amber-50 text-amber-700' },
  in_progress:      { label: 'In Progress',      dot: 'bg-status-progress', badge: 'bg-blue-50 text-blue-700' },
  resolved:         { label: 'Resolved',         dot: 'bg-status-resolved', badge: 'bg-emerald-50 text-emerald-700' },
  closed:           { label: 'Closed',           dot: 'bg-ink-400',         badge: 'bg-cream-200 text-ink-500' },
  reopened:         { label: 'Reopened',         dot: 'bg-orange-500',      badge: 'bg-orange-50 text-orange-700 border border-orange-200' },
  action_not_taken: { label: 'Action Not Taken', dot: 'bg-status-overdue',  badge: 'bg-red-50 text-red-700' },
}

// Steps shown in the citizen "Track Complaint" timeline
export const TRACK_STEPS = [
  STATUS.RECEIVED,
  STATUS.ASSIGNED,
  STATUS.WORK_STARTED,
  STATUS.IN_PROGRESS,
  STATUS.RESOLVED,
]

// ================= PRIORITY =================
export const PRIORITY = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
}

export const PRIORITY_META = {
  high:   { label: 'High',   badge: 'bg-red-50 text-red-700 border-red-200',         slaHours: 48 },
  medium: { label: 'Medium', badge: 'bg-amber-50 text-amber-700 border-amber-200',   slaHours: 120 },
  low:    { label: 'Low',    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', slaHours: 240 },
}

// ================= COMPLAINT INPUT MODES =================
export const INPUT_MODES = {
  TEXT: 'text',
  VOICE: 'voice',
  PHOTO: 'photo',
}

// ================= SLA =================
export const SLA_REMINDER_BEFORE_HOURS = 12 // remind officer this many hours before due

// ================= STORAGE KEYS =================
export const STORAGE_KEYS = {
  AUTH: 'midc_auth',
  LANG: 'midc_lang',
  GRIEVANCES: 'midc_grievances',
  NOTIFICATIONS: 'midc_notifications',
  USERS: 'midc_users',
}

// ================= ID FORMAT =================
export const GRIEVANCE_ID_PREFIX = 'MIDC-'