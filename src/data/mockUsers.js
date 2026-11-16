import { ROLES } from '../utils/constants'

// ================= DEMO LOGIN CREDENTIALS =================
// Citizen : citizen/ 123
// Admin   : admin      / 123

export const users = [
  // ---------- CITIZENS ----------
  {
    id: 'USR-C001',
    role: ROLES.CITIZEN,
    loginId: 'citizen',
    password: '123',
    name: 'Rahul Deshmukh',
    nameMr: 'राहुल देशमुख',
    mobile: '9876543210',
    email: 'rahul.deshmukh@example.com',
    address: 'Plot C-24, Andheri MIDC, Mumbai',
    divisionId: 'DIV-MUM',
    areaId: 'AR-AND',
    language: 'en',
    avatar: null,
    joinedOn: '2024-11-10',
  },
 

  // ---------- ADMIN ----------
  {
    id: 'USR-A001',
    role: ROLES.ADMIN,
    loginId: 'admin',
    password: 'admin123',
    name: 'System Admin',
    nameMr: 'सिस्टम ॲडमिन',
    mobile: '9000000001',
    email: 'admin@midcindia.org',
    designation: 'Super Administrator',
    language: 'en',
    avatar: null,
    joinedOn: '2024-04-01',
  },
]