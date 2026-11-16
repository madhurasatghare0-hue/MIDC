import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { useAuth } from '../context/AuthContext'
import { ROLES } from '../utils/constants'

// Auth pages
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'

// Layouts
import CitizenLayout from '../layouts/CitizenLayout'
import AdminLayout from '../layouts/AdminLayout'

// Citizen pages (Steps 5, 6, 7)
import CitizenDashboard from '../pages/citizen/CitizenDashboard'
import RegisterGrievance from '../pages/citizen/RegisterGrievance'
import MyGrievances from '../pages/citizen/MyGrievances'
import ComplaintDetails from '../pages/citizen/ComplaintDetails'
import TrackComplaint from '../pages/citizen/TrackComplaint'
import Notifications from '../pages/citizen/Notifications'
import Profile from '../pages/citizen/Profile'
import HelpSupport from '../pages/citizen/HelpSupport'

// Admin pages (Steps 8, 9, 10 & 11)
import AdminDashboard from '../pages/admin/AdminDashboard'
import GrievanceManagement from '../pages/admin/GrievanceManagement'
import AdminGrievanceDetails from '../pages/admin/AdminGrievanceDetails'
import Assignments from '../pages/admin/Assignments'
import AdminMapView from '../pages/admin/AdminMapView'
import DepartmentPerformance from '../pages/admin/DepartmentPerformance'
import ReportsAnalytics from '../pages/admin/ReportsAnalytics'
import MasterData from '../pages/admin/MasterData'
import UserManagement from '../pages/admin/UserManagement'
import AdminSettings from '../pages/admin/AdminSettings'

// Temporary placeholder for coming soon pages
import ComingSoon from '../components/common/ComingSoon'

function RootRedirect() {
  const { isAuthenticated, user } = useAuth()
  return <Navigate to={isAuthenticated ? `/${user.role}` : '/login'} replace />
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Root */}
      <Route path="/" element={<RootRedirect />} />

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      

      
      <Route
        path="/citizen"
        element={
          <ProtectedRoute allowedRoles={[ROLES.CITIZEN]}>
            <CitizenLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<CitizenDashboard />} />
        <Route path="register" element={<RegisterGrievance />} />
        <Route path="grievances" element={<MyGrievances />} />
        <Route path="grievances/:id" element={<ComplaintDetails />} />
        <Route path="track" element={<TrackComplaint />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile" element={<Profile />} />
        <Route path="help" element={<HelpSupport />} />
      </Route>

      
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="grievances" element={<GrievanceManagement />} />
        <Route path="grievances/:id" element={<AdminGrievanceDetails />} />
        <Route path="assignments" element={<Assignments />} />
        <Route path="map" element={<AdminMapView />} />
        <Route path="departments" element={<DepartmentPerformance />} />
        <Route path="reports" element={<ReportsAnalytics />} />
        <Route path="master-data" element={<MasterData />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
export default AppRoutes
