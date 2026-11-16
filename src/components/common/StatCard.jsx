export default function StatCard({
  icon: Icon,
  iconBg = 'bg-brand-50 text-brand-600',
  title,
  value,
  trend,
  trendPositive = true,
  trendText = 'vs. previous period',
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-cream-200/90 shadow-card flex items-start gap-4 transition hover:shadow-raised">
      {Icon && (
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
          <Icon className="w-6 h-6" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <span className="text-xs font-medium text-ink-500 block mb-0.5">{title}</span>
        <div className="font-display font-bold text-2xl lg:text-3xl text-ink-900 tracking-tight">
          {value}
        </div>
        {trend && (
          <div className="flex items-center gap-1.5 mt-1 text-xs">
            <span
              className={`font-semibold ${
                trendPositive ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              {trend}
            </span>
            <span className="text-ink-400">{trendText}</span>
          </div>
        )}
      </div>
    </div>
  )
}
