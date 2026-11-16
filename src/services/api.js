import { storage } from './storage'
import { divisions, categories, departments, officers, industrialUnits } from '../data/mockMaster'
import { STATUS, PRIORITY, PRIORITY_META, GRIEVANCE_ID_PREFIX } from '../utils/constants'
import { distanceInMeters } from '../utils/geo'

// Simulated async delay
const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms))

export const api = {
  // ================= AUTH =================
  async login(loginId, password) {
    await delay()
    const users = storage.getUsers()
    // Match demo logins or credentials
    // Note: citizen / 123, admin / 123 (support both 123 and admin123)
    const user = users.find(
      (u) =>
        u.loginId.toLowerCase() === loginId.trim().toLowerCase() &&
        (u.password === password || (u.loginId === 'admin' && (password === '123' || password === 'admin123')))
    )

    if (!user) {
      throw new Error('Invalid login credentials')
    }

    // strip sensitive password before storing in auth session
    const { password: _, ...sessionUser } = user
    storage.setAuth(sessionUser)
    return sessionUser
  },

  async logout() {
    await delay(50)
    storage.clearAuth()
    return true
  },

  async getCurrentUser() {
    return storage.getAuth()
  },

  // ================= MASTER DATA =================
  async getDivisions() {
    return divisions
  },

  async getCategories() {
    return categories
  },

  async getDepartments() {
    return departments
  },

  async getOfficers() {
    return officers
  },

  async getIndustrialUnits(areaId) {
    if (!areaId) return industrialUnits
    return industrialUnits.filter((u) => u.areaId === areaId)
  },

  // ================= DUPLICATE DETECTION =================
  async checkDuplicates({ categoryId, lat, lng, radiusMeters = 200, daysLimit = 7 }) {
    await delay(100)
    if (!lat || !lng || !categoryId) return []
    const list = storage.getGrievances()
    const cutoffTime = Date.now() - daysLimit * 24 * 60 * 60 * 1000

    return list.filter((g) => {
      // Must be same category
      if (g.categoryId !== categoryId) return false
      // Must be open/active
      if (g.status === STATUS.RESOLVED || g.status === STATUS.CLOSED) return false
      // Created within daysLimit
      const createdAtMs = new Date(g.createdAt).getTime()
      if (createdAtMs < cutoffTime) return false
      // Geodesic distance within radius
      if (!g.location?.lat || !g.location?.lng) return false
      const dist = distanceInMeters(lat, lng, g.location.lat, g.location.lng)
      return dist <= radiusMeters
    })
  },

  async getCluster(clusterId) {
    if (!clusterId) return []
    const list = storage.getGrievances()
    return list.filter((g) => g.clusterId === clusterId)
  },

  // ================= GRIEVANCES =================
  async getGrievances(filters = {}) {
    await delay()
    let list = storage.getGrievances()

    if (filters.citizenId) {
      list = list.filter((g) => g.citizenId === filters.citizenId || g.citizen?.id === filters.citizenId)
    }
    if (filters.status) {
      list = list.filter((g) => g.status === filters.status)
    }
    if (filters.priority) {
      list = list.filter((g) => g.priority === filters.priority)
    }
    if (filters.divisionId) {
      list = list.filter((g) => g.divisionId === filters.divisionId)
    }
    if (filters.areaId) {
      list = list.filter((g) => g.areaId === filters.areaId)
    }
    if (filters.categoryId) {
      list = list.filter((g) => g.categoryId === filters.categoryId)
    }
    if (filters.search) {
      const q = filters.search.toLowerCase()
      list = list.filter(
        (g) =>
          g.id.toLowerCase().includes(q) ||
          g.title.toLowerCase().includes(q) ||
          (g.description && g.description.toLowerCase().includes(q))
      )
    }

    return list
  },

  async getGrievanceById(id) {
    await delay()
    const list = storage.getGrievances()
    return list.find((g) => g.id === id) || null
  },

  async createGrievance(data) {
    await delay(300)
    const list = storage.getGrievances()
    const now = new Date().toISOString()
    const nextIdNumber = 6000 + list.length + 1
    const id = `${GRIEVANCE_ID_PREFIX}${nextIdNumber}`

    // Cluster logic: if linked to existing cluster or duplicate detected
    let clusterId = data.clusterId || null
    if (!clusterId && data.location?.lat && data.location?.lng && data.categoryId) {
      const duplicates = await api.checkDuplicates({
        categoryId: data.categoryId,
        lat: data.location.lat,
        lng: data.location.lng,
      })
      if (duplicates.length > 0) {
        // Reuse existing clusterId or assign new clusterId to all
        clusterId = duplicates[0].clusterId || `CLUST-${Date.now().toString().slice(-4)}`
        // Ensure the existing matched duplicate also gets tagged if it didn't have one
        if (!duplicates[0].clusterId) {
          duplicates[0].clusterId = clusterId
          storage.setGrievances(list)
        }
      }
    }

    const priority = data.priority || PRIORITY.MEDIUM
    const slaHours = PRIORITY_META[priority]?.slaHours || 120
    const slaDueAt = new Date(Date.now() + slaHours * 60 * 60 * 1000).toISOString()

    const newGrievance = {
      id,
      ...data,
      clusterId,
      status: STATUS.RECEIVED,
      priority,
      slaDueAt,
      createdAt: now,
      updatedAt: now,
      timeline: [
        {
          status: STATUS.RECEIVED,
          timestamp: now,
          comment: clusterId
            ? 'Grievance submitted. AI linked this complaint to a nearby duplicate cluster.'
            : 'Grievance submitted successfully.',
          actor: data.citizen?.name || 'Citizen',
        },
      ],
    }

    const updatedList = [newGrievance, ...list]
    storage.setGrievances(updatedList)

    // Notify citizen
    if (data.citizen?.id) {
      api.createNotification({
        audience: data.citizen.id,
        type: 'status_update',
        title: 'Complaint registered successfully',
        message: `Your complaint (${id}) has been received and logged into the MIDC system.`,
        grievanceId: id,
      })
    }

    return newGrievance
  },

  async updateGrievanceStatus(id, newStatus, comment = '', actor = 'Admin', options = {}) {
    await delay()
    const list = storage.getGrievances()
    const index = list.findIndex((g) => g.id === id)
    if (index === -1) throw new Error('Grievance not found')

    const current = list[index]
    const now = new Date().toISOString()
    const { photo = null, rating = null, feedback = null, officerId = null } = options

    const updated = {
      ...current,
      status: newStatus,
      updatedAt: now,
      ...(officerId ? { assignedOfficerId: officerId } : {}),
      ...(rating ? { rating, feedback } : {}),
      timeline: [
        ...(current.timeline || []),
        {
          status: newStatus,
          timestamp: now,
          at: now,
          comment: comment || `Status updated to ${newStatus}`,
          note: comment,
          actor,
          by: actor,
          ...(photo ? { photo } : {}),
        },
      ],
    }

    list[index] = updated
    storage.setGrievances([...list])

    // Notify citizen if attached
    if (updated.citizen?.id) {
      api.createNotification({
        audience: updated.citizen.id,
        type: 'status_update',
        title: `Complaint status updated: ${newStatus}`,
        message: comment || `Your complaint ${id} status has been updated to ${newStatus}.`,
        grievanceId: id,
      })
    }

    return updated
  },

  async reopenGrievance(id, reason, citizenName = 'Citizen') {
    return api.updateGrievanceStatus(
      id,
      STATUS.REOPENED,
      `Citizen reported dissatisfaction and reopened complaint: "${reason}"`,
      citizenName
    )
  },

  async submitGrievanceRating(id, rating, feedback = '') {
    return api.updateGrievanceStatus(
      id,
      STATUS.CLOSED,
      `Citizen rated resolution: ${rating} / 5 stars${feedback ? ` - "${feedback}"` : ''}`,
      'Citizen',
      { rating, feedback }
    )
  },

  // ================= NOTIFICATIONS =================
  async getNotifications(audience) {
    await delay()
    const all = storage.getNotifications()
    if (!audience) return all
    return all.filter((n) => n.audience === audience || (audience !== 'admin' && n.audience === 'all'))
  },

  async markNotificationAsRead(id) {
    const list = storage.getNotifications()
    const updated = list.map((n) => (n.id === id ? { ...n, read: true } : n))
    storage.setNotifications(updated)
    return true
  },

  async markAllNotificationsAsRead(audience) {
    const list = storage.getNotifications()
    const updated = list.map((n) =>
      !audience || n.audience === audience ? { ...n, read: true } : n
    )
    storage.setNotifications(updated)
    return true
  },

  async createNotification(notifData) {
    const list = storage.getNotifications()
    const newNotif = {
      id: `NT-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
      read: false,
      ...notifData,
    }
    storage.setNotifications([newNotif, ...list])
    return newNotif
  },

  // ================= AI SIMULATION =================
  async aiAnalyze({ text = '', lang = 'en' } = {}) {
    await delay(350)
    const textLower = text.toLowerCase().trim()
    const allCategories = await api.getCategories()
    const allDepts = await api.getDepartments()

    // Urgent keywords trigger HIGH priority
    const urgentKeywords = [
      'fire', 'gas', 'leak', 'accident', 'burst', 'explosion', 'danger', 'hazard', 'toxic', 'collapse',
      'आग', 'स्फोट', 'धूर', 'विषारी', 'गळती', 'अपघात', 'धोका', 'धोकादायक'
    ]
    const isUrgent = urgentKeywords.some((w) => textLower.includes(w))

    // Score categories based on keyword matches
    let bestCat = null
    let bestMatches = []
    let maxHits = 0
    let matchedCategories = []

    for (const cat of allCategories) {
      const hits = (cat.keywords || []).filter((kw) => textLower.includes(kw.toLowerCase()))
      if (hits.length > 0) {
        matchedCategories.push({ cat, hits })
      }
      if (hits.length > maxHits) {
        maxHits = hits.length
        bestCat = cat
        bestMatches = hits
      }
    }

    if (!bestCat) {
      bestCat = allCategories[0] || { id: 'CAT-POT', defaultPriority: 'medium' }
    }

    // Collect all departments involved across matched categories (supporting multi-department routing)
    const involvedDeptIds = new Set(bestCat.departments || ['DEP-ENG'])
    matchedCategories.forEach(({ cat }) => {
      ;(cat.departments || []).forEach((d) => involvedDeptIds.add(d))
    })
    const departmentsList = Array.from(involvedDeptIds)

    // Confidence calculation (heuristic: based on match count and text length)
    let confidence = 0.72
    if (maxHits >= 3) confidence = 0.96
    else if (maxHits === 2) confidence = 0.89
    else if (maxHits === 1) confidence = 0.82
    else if (textLower.length > 20) confidence = 0.75

    const priority = isUrgent ? PRIORITY.HIGH : (bestCat.defaultPriority || PRIORITY.MEDIUM)

    // Build reasoning list
    const reasons = []
    if (isUrgent) {
      reasons.push(
        lang === 'mr'
          ? 'तातडीच्या सुरक्षिततेशी संबंधित शब्दांमुळे उच्च प्राधान्य (High Priority) दिले गेले.'
          : 'Elevated to High Priority due to critical safety/emergency terms detected.'
      )
    }
    if (bestMatches.length > 0) {
      reasons.push(
        lang === 'mr'
          ? `मुख्य शब्द जुळले: "${bestMatches.slice(0, 3).join(', ')}"`
          : `Matched relevant keywords: "${bestMatches.slice(0, 3).join(', ')}"`
      )
    } else {
      reasons.push(
        lang === 'mr'
          ? 'मजकुराच्या संदर्भावरून प्राथमिक श्रेणी अनुमानित केली आहे.'
          : 'Categorized based on contextual semantics and department responsibility.'
      )
    }

    // Generate draft title and description
    let draftTitle = ''
    if (text.length > 60) {
      draftTitle = `${text.substring(0, 60).trim()}...`
    } else if (text.length > 0) {
      draftTitle = text
    } else {
      draftTitle = lang === 'mr' ? 'नागरिक औद्योगिक तक्रार अहवाल' : 'Industrial Grievance Report'
    }

    return {
      category: bestCat,
      categoryId: bestCat.id,
      departments: departmentsList.length > 0 ? departmentsList : bestCat.departments || ['DEP-ENG'],
      priority,
      confidence,
      draftTitle,
      draftDescription: text || (lang === 'mr' ? 'समस्या नोंदवण्यात आली आहे.' : 'Issue reported via citizen portal.'),
      rawDescription: text,
      reasons,
    }
  },

  // ================= AUTOMATIC SLA ESCALATION ENGINE =================
  async runSlaCheck() {
    await delay(50)
    const list = storage.getGrievances()
    const now = Date.now()
    let updatedCount = 0

    const updatedList = list.map((g) => {
      // Skip already resolved or closed tickets
      if (g.status === STATUS.RESOLVED || g.status === STATUS.CLOSED) return g

      // Compute SLA hours based on priority
      const slaHours = PRIORITY_META[g.priority]?.slaHours || (g.priority === 'high' ? 24 : g.priority === 'low' ? 72 : 48)
      const createdTime = new Date(g.createdAt).getTime()
      const dueTime = createdTime + slaHours * 60 * 60 * 1000
      const remainingMs = dueTime - now

      // Check if ticket is overdue (> due date)
      if (remainingMs <= 0 && g.status !== STATUS.ACTION_NOT_TAKEN) {
        updatedCount++
        const isoNow = new Date().toISOString()
        api.createNotification({
          audience: 'admin',
          type: 'sla_breach',
          title: `SLA Breached: Grievance ${g.id}`,
          message: `Ticket ${g.id} (${g.title}) has exceeded its ${slaHours}h resolution deadline. Escalated for immediate supervisory action.`,
          grievanceId: g.id,
        })

        return {
          ...g,
          status: STATUS.ACTION_NOT_TAKEN,
          overdue: true,
          escalated: true,
          updatedAt: isoNow,
          timeline: [
            ...(g.timeline || []),
            {
              status: STATUS.ACTION_NOT_TAKEN,
              timestamp: isoNow,
              at: isoNow,
              comment: `System SLA escalation: Resolution deadline of ${slaHours}h expired without closure.`,
              note: `Automated SLA escalation triggered.`,
              actor: 'MIDC SLA Engine',
              by: 'MIDC SLA Engine',
            },
          ],
        }
      }

      // Check if ticket is approaching due date (< 12 hours remaining) and needs reminder
      if (remainingMs > 0 && remainingMs <= 12 * 60 * 60 * 1000 && !g.slaReminderSent) {
        api.createNotification({
          audience: 'admin',
          type: 'sla_warning',
          title: `SLA Warning: Grievance ${g.id}`,
          message: `Ticket ${g.id} is due within ${Math.round(remainingMs / 3600000)} hours. Priority: ${g.priority.toUpperCase()}.`,
          grievanceId: g.id,
        })
        return {
          ...g,
          slaReminderSent: true,
        }
      }

      return g
    })

    if (updatedCount > 0) {
      storage.setGrievances(updatedList)
    }

    return { updatedCount, totalChecked: list.length }
  },
}
