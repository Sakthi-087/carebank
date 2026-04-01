const toneStyles = {
  good: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  danger: 'border-rose-200 bg-rose-50 text-rose-700',
  neutral: 'border-slate-200 bg-slate-50 text-slate-700',
}

export function KpiCard({ item }) {
  return (
    <div className="rounded-[26px] border border-slate-200/70 bg-white p-5 shadow-xl shadow-slate-900/5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{item.title}</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{item.value}</p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${toneStyles[item.tone] || toneStyles.neutral}`}>
          {item.tone}
        </span>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-500">{item.subtitle}</p>
    </div>
  )
}

export function SectionCard({ title, subtitle, children, action }) {
  return (
    <section className="rounded-[28px] border border-slate-200/70 bg-white/95 p-6 shadow-2xl shadow-slate-900/5">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm leading-6 text-slate-500">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}
