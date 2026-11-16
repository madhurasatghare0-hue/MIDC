import { useState } from 'react'
import { Database, Plus, Search, Layers, Building2, MapPin, Tag } from 'lucide-react'
import { divisions, categories, departments } from '../../data/mockMaster'

export default function MasterData() {
  const [activeTab, setActiveTab] = useState('divisions') // 'divisions' | 'categories' | 'departments'
  const [search, setSearch] = useState('')

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl lg:text-3xl text-ink-900 tracking-tight">
            Master Data Configuration
          </h1>
          <p className="text-xs sm:text-sm text-ink-500 mt-1">
            Manage MIDC administrative divisions, industrial areas, complaint categories, and departments.
          </p>
        </div>

        <button
          onClick={() => alert('New entry modal simulated for demo.')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-brand transition cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Record</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-cream-200 pb-2">
        <button
          onClick={() => setActiveTab('divisions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'divisions'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'bg-white text-ink-700 border border-cream-200 hover:bg-cream-50'
          }`}
        >
          Divisions &amp; Areas ({divisions.length})
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'categories'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'bg-white text-ink-700 border border-cream-200 hover:bg-cream-50'
          }`}
        >
          Categories &amp; AI Routing ({categories.length})
        </button>

        <button
          onClick={() => setActiveTab('departments')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'departments'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'bg-white text-ink-700 border border-cream-200 hover:bg-cream-50'
          }`}
        >
          Departments ({departments.length})
        </button>
      </div>

      {/* Tab 1: Divisions */}
      {activeTab === 'divisions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {divisions.map((div) => (
            <div
              key={div.id}
              className="bg-white rounded-2xl p-5 border border-cream-200/90 shadow-card space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-base text-ink-900">{div.name}</h3>
                  <span className="text-xs text-brand-700 font-medium">{div.nameMr}</span>
                </div>
                <span className="font-mono text-xs text-ink-400 bg-cream-100 px-2 py-0.5 rounded">
                  {div.id}
                </span>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-cream-100">
                <span className="text-[11px] font-bold text-ink-500 uppercase tracking-wider block">
                  Industrial Areas ({div.areas.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {div.areas.map((a) => (
                    <span
                      key={a.id}
                      className="px-2.5 py-1 rounded-lg bg-cream-50 border border-cream-200 text-ink-700 text-xs"
                    >
                      {a.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Categories */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-3xl p-6 border border-cream-200/90 shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-cream-200 bg-cream-50/70 text-ink-600 font-semibold">
                  <th className="py-3 px-4">Category Name</th>
                  <th className="py-3 px-4">Primary Department</th>
                  <th className="py-3 px-4">Default Priority</th>
                  <th className="py-3 px-4">AI Keywords (EN + MR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-cream-50/40">
                    <td className="py-3 px-4">
                      <strong className="text-ink-900 block">{cat.name}</strong>
                      <span className="text-[11px] text-ink-500">{cat.nameMr}</span>
                    </td>
                    <td className="py-3 px-4 text-brand-700 font-bold">{cat.departments[0]}</td>
                    <td className="py-3 px-4 uppercase font-semibold text-amber-700">
                      {cat.defaultPriority}
                    </td>
                    <td className="py-3 px-4 text-ink-500 max-w-xs truncate">
                      {cat.keywords?.join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Departments */}
      {activeTab === 'departments' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {departments.map((d) => (
            <div
              key={d.id}
              className="bg-white rounded-2xl p-5 border border-cream-200/90 shadow-card flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-ink-900">{d.name}</h4>
                <span className="text-[11px] text-ink-500 block">{d.nameMr}</span>
                <span className="font-mono text-[10px] text-ink-400">{d.id}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
