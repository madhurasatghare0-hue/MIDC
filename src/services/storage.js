import { STORAGE_KEYS } from '../utils/constants'
import { users as defaultUsers } from '../data/mockUsers'
import { grievances as defaultGrievances } from '../data/mockGrievances'
import { notifications as defaultNotifications } from '../data/mockNotifications'

// Helper: safe JSON parse with fallback
const get = (key, fallback = null) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e)
    return fallback
  }
}

// Helper: safe JSON stringify and set
const set = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val))
  } catch (e) {
    console.error(`Error writing ${key} to storage:`, e)
  }
}

export const storage = {
  // Initialize mock data in localStorage on first run
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      set(STORAGE_KEYS.USERS, defaultUsers)
    }
    if (!localStorage.getItem(STORAGE_KEYS.GRIEVANCES)) {
      set(STORAGE_KEYS.GRIEVANCES, defaultGrievances)
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      set(STORAGE_KEYS.NOTIFICATIONS, defaultNotifications)
    }
    if (!localStorage.getItem(STORAGE_KEYS.LANG)) {
      set(STORAGE_KEYS.LANG, 'en')
    }
  },

  // Reset all mock data back to defaults
  reset() {
    set(STORAGE_KEYS.USERS, defaultUsers)
    set(STORAGE_KEYS.GRIEVANCES, defaultGrievances)
    set(STORAGE_KEYS.NOTIFICATIONS, defaultNotifications)
    localStorage.removeItem(STORAGE_KEYS.AUTH)
    set(STORAGE_KEYS.LANG, 'en')
  },

  // Auth
  getAuth: () => get(STORAGE_KEYS.AUTH, null),
  setAuth: (user) => set(STORAGE_KEYS.AUTH, user),
  clearAuth: () => localStorage.removeItem(STORAGE_KEYS.AUTH),

  // Language
  getLang: () => get(STORAGE_KEYS.LANG, 'en'),
  setLang: (lang) => set(STORAGE_KEYS.LANG, lang),

  // Users
  getUsers: () => get(STORAGE_KEYS.USERS, defaultUsers),
  setUsers: (users) => set(STORAGE_KEYS.USERS, users),

  // Grievances
  getGrievances: () => get(STORAGE_KEYS.GRIEVANCES, defaultGrievances),
  setGrievances: (grievances) => set(STORAGE_KEYS.GRIEVANCES, grievances),

  // Notifications
  getNotifications: () => get(STORAGE_KEYS.NOTIFICATIONS, defaultNotifications),
  setNotifications: (notifs) => set(STORAGE_KEYS.NOTIFICATIONS, notifs),
}
