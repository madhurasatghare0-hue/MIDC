export default function StatusBadge({ status, label }) {
  const norm = (status || '').toLowerCase()

  let style = 'bg-cream-200 text-ink-700'
  let dot = 'bg-status-received'
  let displayLabel = label || status

  if (norm === 'in_progress' || norm === 'in progress') {
    style = 'bg-blue-50 text-blue-700 border border-blue-200/70'
    dot = 'bg-blue-600'
    displayLabel = label || 'In Progress'
  } else if (norm === 'pending' || norm === 'work_started' || norm === 'work started') {
    style = 'bg-amber-50 text-amber-700 border border-amber-200/70'
    dot = 'bg-amber-500'
    displayLabel = label || 'Pending'
  } else if (norm === 'resolved') {
    style = 'bg-emerald-50 text-emerald-700 border border-emerald-200/70'
    dot = 'bg-emerald-600'
    displayLabel = label || 'Resolved'
  } else if (norm === 'assigned') {
    style = 'bg-violet-50 text-violet-700 border border-violet-200/70'
    dot = 'bg-violet-600'
    displayLabel = label || 'Assigned'
  } else if (norm === 'action_not_taken' || norm === 'overdue') {
    style = 'bg-red-50 text-red-700 border border-red-200/70'
    dot = 'bg-red-600'
    displayLabel = label || 'Overdue'
  } else if (norm === 'closed') {
    style = 'bg-cream-200 text-ink-500 border border-cream-300'
    dot = 'bg-ink-400'
    displayLabel = label || 'Closed'
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium tracking-tight ${style}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      <span>{displayLabel}</span>
    </span>
  )
}
