import { useState, useEffect } from 'react'
import { UsersRound, UserCheck, Shield, Phone, Mail, Search, Plus, Filter } from 'lucide-react'
import { storage } from '../../services/storage'
import { ROLES } from '../../utils/constants'

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [roleFilter, setRoleFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    setUsers(storage.getUsers())
  }, [])

  const filtered = users.filter((u) => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter
    const matchesSearch =
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.loginId.toLowerCase().includes(search.toLowerCase()) ||
      u.mobile.includes(search)
    return matchesRole && matchesSearch
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl lg:text-3xl text-ink-900 tracking-tight">
            User Management
          </h1>
          <p className="text-xs sm:text-sm text-ink-500 mt-1">
            Manage citizen logins, administrative officers, and role-based permissions.
          </p>
        </div>

        <button
          onClick={() => alert('Add user simulated for demo.')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-brand transition cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add System User</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl p-4 border border-cream-200/90 shadow-card flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-ink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, login ID, or phone..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-cream-300 bg-cream-50/50 text-xs text-ink-900 focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-ink-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-cream-300 bg-white text-xs font-semibold text-ink-700"
          >
            <option value="all">All Roles</option>
            <option value={ROLES.ADMIN}>Administrators</option>
            <option value={ROLES.CITIZEN}>Citizens</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl p-6 border border-cream-200/90 shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-cream-200 bg-cream-50/70 text-ink-600 font-semibold">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Login ID</th>
                <th className="py-3 px-4">Mobile</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-cream-50/40">
                  <td className="py-3 px-4">
                    <strong className="text-ink-900 block">{u.name}</strong>
                    {u.designation && (
                      <span className="text-[11px] text-ink-400">{u.designation}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                        u.role === 'admin'
                          ? 'bg-brand-50 text-brand-700 border border-brand-200'
                          : 'bg-cream-200 text-ink-700'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-medium text-ink-800">{u.loginId}</td>
                  <td className="py-3 px-4 text-ink-600">{u.mobile}</td>
                  <td className="py-3 px-4 text-ink-600">{u.email}</td>
                  <td className="py-3 px-4 text-ink-400">{u.joinedOn || '2024-11-10'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
