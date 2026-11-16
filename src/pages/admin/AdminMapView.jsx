import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.heat'
import { MapPin, Building2, Filter, Layers, Flame } from 'lucide-react'
import { api } from '../../services/api'
import StatusBadge from '../../components/common/StatusBadge'
import { Link } from 'react-router-dom'

// HeatLayer Leaflet helper component
function HeatmapLayer({ points }) {
  const map = useMap()

  useEffect(() => {
    if (!map || !points || points.length === 0) return

    const heatLayer = L.heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 15,
      gradient: { 0.4: '#3b82f6', 0.65: '#f59e0b', 1.0: '#ef4444' },
    }).addTo(map)

    return () => {
      map.removeLayer(heatLayer)
    }
  }, [map, points])

  return null
}

// Leaflet pin fix
const pinIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

export default function AdminMapView() {
  const [grievances, setGrievances] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewMode, setViewMode] = useState('pins') // 'pins' | 'heat'

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const gList = await api.getGrievances()
        // Take grievances with valid lat/lng
        setGrievances(gList.filter((g) => g.location?.lat && g.location?.lng))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = grievances.filter(
    (g) => statusFilter === 'all' || g.status === statusFilter
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl lg:text-3xl text-ink-900 tracking-tight">
            Industrial Geographic Map View
          </h1>
          <p className="text-xs sm:text-sm text-ink-500 mt-1">
            Visual geospatial distribution of logged grievances across Maharashtra MIDC zones.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Pins vs Heat Map Toggle */}
          <div className="flex items-center rounded-xl border border-cream-300 bg-cream-50 p-1">
            <button
              type="button"
              onClick={() => setViewMode('pins')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition ${
                viewMode === 'pins'
                  ? 'bg-white text-brand-700 shadow-2xs'
                  : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-brand-600" />
              <span>Pins Map</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('heat')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition ${
                viewMode === 'heat'
                  ? 'bg-white text-brand-700 shadow-2xs'
                  : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-600" />
              <span>Density Heat Map</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-ink-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-cream-300 bg-white text-xs font-semibold text-ink-700"
            >
              <option value="all">All Complaints ({grievances.length})</option>
              <option value="received">Received</option>
              <option value="work_started">Work Started</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="action_not_taken">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-4 border border-cream-200/90 shadow-card">
        <div className="h-[550px] rounded-2xl overflow-hidden border border-cream-200">
          <MapContainer
            center={[19.1176, 72.8697]}
            zoom={8}
            scrollWheelZoom={true}
            className="w-full h-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Heat Map Layer */}
            {viewMode === 'heat' && (
              <HeatmapLayer
                points={filtered.map((g) => [
                  g.location.lat,
                  g.location.lng,
                  g.priority === 'high' ? 1.0 : g.priority === 'medium' ? 0.6 : 0.3,
                ])}
              />
            )}

            {/* Pins Mode */}
            {viewMode === 'pins' &&
              filtered.map((g) => (
                <Marker
                  key={g.id}
                  position={[g.location.lat, g.location.lng]}
                  icon={pinIcon}
                >
                  <Popup>
                    <div className="p-1 space-y-1 text-xs">
                      <span className="font-mono font-bold text-brand-700 block">{g.id}</span>
                      <strong className="block text-ink-900">{g.title}</strong>
                      <p className="text-[11px] text-ink-600">{g.location.address}</p>
                      <div className="pt-1 flex items-center justify-between">
                        <StatusBadge status={g.status} />
                        <Link
                          to={`/admin/grievances/${g.id}`}
                          className="text-brand-700 font-semibold underline text-[11px]"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
          </MapContainer>
        </div>
      </div>
    </div>
  )
}
