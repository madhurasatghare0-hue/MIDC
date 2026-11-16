import { Check, CircleDot, Clock } from 'lucide-react'

export default function MiniTracker({
  steps = [
    { label: 'Received', date: '01 Jan', state: 'completed' },
    { label: 'Assigned', date: '02 Jan', state: 'completed' },
    { label: 'Work Started', date: '03 Jan', state: 'active' },
    { label: 'In Progress', date: '', state: 'upcoming' },
    { label: 'Resolved / Closed', date: '', state: 'upcoming' },
  ],
}) {
  return (
    <div className="w-full py-2">
      <div className="relative flex items-center justify-between">
        {/* Connector line behind steps */}
        <div className="absolute left-6 right-6 top-3.5 -translate-y-1/2 h-[2px] bg-cream-300 z-0" />

        {steps.map((step, idx) => {
          const isDone = step.state === 'completed'
          const isActive = step.state === 'active'

          return (
            <div
              key={idx}
              className="relative z-10 flex flex-col items-center text-center flex-1"
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                  isDone
                    ? 'bg-emerald-500 text-white ring-4 ring-emerald-50'
                    : isActive
                    ? 'bg-amber-500 text-white ring-4 ring-amber-100 ring-offset-1'
                    : 'bg-white border-2 border-cream-300 text-cream-400'
                }`}
              >
                {isDone ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : isActive ? (
                  <CircleDot className="w-4 h-4 animate-pulse stroke-[2.5]" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-cream-300" />
                )}
              </div>
              <div className="mt-2">
                <div
                  className={`text-xs font-semibold leading-tight ${
                    isDone
                      ? 'text-ink-900'
                      : isActive
                      ? 'text-amber-700 font-bold'
                      : 'text-ink-400'
                  }`}
                >
                  {step.label}
                </div>
                {step.date && (
                  <div className="text-[11px] text-ink-500 mt-0.5">{step.date}</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
