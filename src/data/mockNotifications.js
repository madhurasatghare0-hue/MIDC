// ================= NOTIFICATION TYPES =================
export const NOTIFICATION_TYPES = {
  STATUS_UPDATE: 'status_update',   // citizen: complaint moved to next stage
  ASSIGNED: 'assigned',             // complaint assigned to officer
  PROGRESS_PHOTO: 'progress_photo', // officer uploaded work photo
  RESOLVED: 'resolved',             // complaint resolved
  SLA_REMINDER: 'sla_reminder',     // admin: due date approaching
  OVERDUE: 'overdue',               // admin: SLA breached
  DUPLICATE: 'duplicate',           // admin: AI detected duplicate cluster
  NOTICE: 'notice',                 // admin: notice sent to department
  DAILY_REPORT: 'daily_report',     // admin: daily division report ready
}

const HOUR = 60 * 60 * 1000
const now = Date.now()
const hoursAgo = (h) => new Date(now - h * HOUR).toISOString()

// audience: 'USR-C001' = specific citizen, 'admin' = all admins
export const notifications = [
  // ---------- CITIZEN: Rahul (3 unread) ----------
  {
    id: 'NT-001', audience: 'USR-C001', type: NOTIFICATION_TYPES.STATUS_UPDATE,
    title: 'Work has started on your complaint',
    message: 'The concerned department has initiated action on the reported road damage.',
    grievanceId: 'MIDC-1024', createdAt: hoursAgo(2), read: false,
  },
  {
    id: 'NT-002', audience: 'USR-C001', type: NOTIFICATION_TYPES.PROGRESS_PHOTO,
    title: 'Progress photo uploaded',
    message: 'The officer has uploaded a work progress photo for your drainage complaint.',
    grievanceId: 'MIDC-1026', createdAt: hoursAgo(6), read: false,
  },
  {
    id: 'NT-003', audience: 'USR-C001', type: NOTIFICATION_TYPES.STATUS_UPDATE,
    title: 'Complaint registered successfully',
    message: 'Your complaint about streetlights in Phase II has been received. AI suggested department: Electrical.',
    grievanceId: 'MIDC-1025', createdAt: hoursAgo(9), read: false,
  },
  {
    id: 'NT-004', audience: 'USR-C001', type: NOTIFICATION_TYPES.RESOLVED,
    title: 'Complaint resolved',
    message: 'Your water leakage complaint has been resolved. Please share your feedback.',
    grievanceId: 'MIDC-1023', createdAt: hoursAgo(24 * 14), read: true,
  },
  {
    id: 'NT-005', audience: 'USR-C001', type: NOTIFICATION_TYPES.ASSIGNED,
    title: 'Complaint assigned to officer',
    message: 'Your road damage complaint has been assigned to Sandeep Patil (JE – Civil).',
    grievanceId: 'MIDC-1024', createdAt: hoursAgo(68), read: true,
  },

  // ---------- ADMIN (6 unread) ----------
  {
    id: 'NT-101', audience: 'admin', type: NOTIFICATION_TYPES.OVERDUE,
    title: 'SLA breached – action not taken',
    message: 'High priority complaints in Pune division have crossed their due date with no action recorded.',
    grievanceId: null, createdAt: hoursAgo(1), read: false,
  },
  {
    id: 'NT-102', audience: 'admin', type: NOTIFICATION_TYPES.DUPLICATE,
    title: 'Duplicate cluster detected',
    message: 'AI grouped 5 streetlight complaints on Road No. 16, Andheri MIDC into one cluster.',
    grievanceId: 'MIDC-4901', createdAt: hoursAgo(3), read: false,
  },
  {
    id: 'NT-103', audience: 'admin', type: NOTIFICATION_TYPES.SLA_REMINDER,
    title: 'Due within 12 hours',
    message: '3 drainage complaints in Taloja MIDC are due within 12 hours.',
    grievanceId: 'MIDC-4911', createdAt: hoursAgo(4), read: false,
  },
  {
    id: 'NT-104', audience: 'admin', type: NOTIFICATION_TYPES.STATUS_UPDATE,
    title: 'New high priority complaint',
    message: 'Water pipeline burst reported in Waluj MIDC. AI priority: High.',
    grievanceId: null, createdAt: hoursAgo(5), read: false,
  },
  {
    id: 'NT-105', audience: 'admin', type: NOTIFICATION_TYPES.DAILY_REPORT,
    title: 'Daily division report ready',
    message: 'Today’s grievance summary for all 7 divisions is ready to view.',
    grievanceId: null, createdAt: hoursAgo(8), read: false,
  },
  {
    id: 'NT-106', audience: 'admin', type: NOTIFICATION_TYPES.RESOLVED,
    title: 'Complaint resolved with photo proof',
    message: 'Officer uploaded resolution photo for water leakage complaint MIDC-1023.',
    grievanceId: 'MIDC-1023', createdAt: hoursAgo(10), read: false,
  },
  {
    id: 'NT-107', audience: 'admin', type: NOTIFICATION_TYPES.NOTICE,
    title: 'Notice sent to Environment department',
    message: 'Notice issued to Palghar division for pending pollution complaints.',
    grievanceId: null, createdAt: hoursAgo(30), read: true,
  },
]