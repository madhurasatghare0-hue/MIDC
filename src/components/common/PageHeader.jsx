export default function PageHeader({ title, subtitle, actions, breadcrumbs }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        {breadcrumbs && (
          <div className="text-xs text-ink-400 mb-1 flex items-center gap-1.5">
            {breadcrumbs}
          </div>
        )}
        <h1 className="font-display font-bold text-2xl lg:text-3xl text-ink-900 tracking-tight">
          {title}
        </h1>
        {subtitle && <p className="text-sm text-ink-500 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  )
}
