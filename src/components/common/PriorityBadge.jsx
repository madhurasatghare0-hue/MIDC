import { PRIORITY_META } from '../../utils/constants'

export default function PriorityBadge({ priority, label }) {
  const norm = (priority || '').toLowerCase()
  const meta = PRIORITY_META[norm] || {
    label: 'Normal',
    badge: 'bg-cream-200 text-ink-700 border-cream-300',
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${meta.badge}`}
    >
      {label || meta.label}
    </span>
  )
}
