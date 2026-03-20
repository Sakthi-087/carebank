export function ScoreCard({ health }) {
  return (
    <div className="rounded-3xl border border-emerald-400/20 bg-emerald-500/10 p-6 shadow-glow">
      <p className="text-sm uppercase tracking-[0.25em] text-emerald-300">Financial Health</p>
      <div className="mt-4 flex items-end gap-4">
        <span className="text-6xl font-bold text-white">{health.score}</span>
        <span className="mb-2 rounded-full bg-white/10 px-3 py-1 text-sm text-emerald-200">{health.status}</span>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-200">{health.summary}</p>
      <div className="mt-6 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-950/50 p-4">
          <p className="text-slate-400">Savings rate</p>
          <p className="mt-1 text-xl font-semibold text-white">{health.savings_rate}%</p>
        </div>
        <div className="rounded-2xl bg-slate-950/50 p-4">
          <p className="text-slate-400">Essential spend</p>
          <p className="mt-1 text-xl font-semibold text-white">{health.essential_spend_ratio}%</p>
        </div>
      </div>
    </div>
  )
}

export function MetricCard({ label, value, caption }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-300">{caption}</p>
    </div>
  )
}

export function Panel({ title, subtitle, children }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-slate-400">{subtitle}</p> : null}
        </div>
      </div>
      {children}
    </section>
  )
}
