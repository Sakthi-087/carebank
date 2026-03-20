const items = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'assistant', label: 'AI Assistant' },
  { key: 'settings', label: 'Settings' },
]

export default function Sidebar({ activeRoute, onNavigate }) {
  return (
    <aside className="rounded-xl border border-slate-200 bg-white p-6 shadow-md">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white">CB</div>
        <div>
          <p className="text-lg font-bold text-slate-900">CareBank</p>
          <p className="text-sm text-slate-500">AI financial wellness</p>
        </div>
      </div>

      <nav className="mt-10 space-y-2">
        {items.map((item) => {
          const isActive = activeRoute === item.key
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onNavigate(item.key)}
              className={`w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                isActive ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
