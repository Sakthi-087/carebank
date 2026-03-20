const navItems = [
  'Overview',
  'Health Score',
  'Spending',
  'Alerts',
  'Recommendations',
  'Assistant',
]

export default function Sidebar() {
  return (
    <aside className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur-xl">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">CareBank</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Financial Wellness OS</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Agentic AI for smarter money decisions, proactive alerts, and clear financial guidance.
        </p>
      </div>
      <nav className="mt-10 space-y-3">
        {navItems.map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-white/5 bg-slate-900/70 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-emerald-400/40 hover:text-white"
          >
            {item}
          </div>
        ))}
      </nav>
    </aside>
  )
}
