import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { KpiCard, SectionCard } from './Cards'

const colors = ['#0891b2', '#2563eb', '#f59e0b', '#ef4444']
const alertStyles = ['border-amber-200 bg-amber-50 text-amber-800', 'border-yellow-200 bg-yellow-50 text-yellow-800', 'border-rose-200 bg-rose-50 text-rose-800']

function RiskPill({ risk }) {
  const styles = {
    High: 'border-rose-200 bg-rose-50 text-rose-700',
    Medium: 'border-amber-200 bg-amber-50 text-amber-700',
    Low: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  }

  return <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${styles[risk] || styles.Low}`}>{risk}</span>
}

export default function Dashboard({ analysis, financialScore, fraudCheck }) {
  const flaggedTransactions = fraudCheck?.flagged_transactions || []
  const topFlags = flaggedTransactions.slice(0, 3)

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {analysis.kpis.map((item) => (
          <KpiCard key={item.title} item={item} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionCard title="Score Snapshot" subtitle="Deterministic financial health driven by explainable signals">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl bg-slate-900 p-6 text-white">
              <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">Financial score</p>
              <p className="mt-3 text-5xl font-bold">{financialScore.score}</p>
              <p className="mt-3 text-sm text-slate-200">{financialScore.status} outlook based on current behavior.</p>
            </div>
            <div className="grid gap-3">
              {Object.entries(financialScore.breakdown).map(([key, value]) => (
                <div key={key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold capitalize text-slate-900">{key.replace('_', ' ')}</p>
                    <span className="text-lg font-bold text-slate-900">{value}</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-slate-200">
                    <div className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600" style={{ width: `${value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Fraud Safety Layer" subtitle="Recent suspicious transactions flagged from behavior anomalies">
          {topFlags.length ? (
            <div className="space-y-3">
              {topFlags.map((item) => (
                <div key={`${item.description}-${item.amount}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{item.description}</p>
                      <p className="mt-1 text-sm text-slate-500">Rs {Number(item.amount).toLocaleString('en-IN')}</p>
                    </div>
                    <RiskPill risk={item.risk} />
                  </div>
                  <p className="mt-3 text-sm text-slate-600">{item.flags.join(', ')}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-800">
              No medium or high risk transactions are currently flagged.
            </div>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard title="Spending Breakdown" subtitle="Current month category distribution">
          <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={analysis.chart_data} dataKey="value" nameKey="name" innerRadius={65} outerRadius={110} paddingAngle={4} isAnimationActive>
                    {analysis.chart_data.map((entry, index) => (
                      <Cell key={entry.name} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `Rs ${Number(value).toLocaleString('en-IN')}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              {analysis.chart_data.map((item, index) => (
                <div key={item.name} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                      <p className="font-semibold text-slate-900">{item.name}</p>
                    </div>
                    <p className="text-sm font-medium text-slate-600">{item.change >= 0 ? '+' : ''}{item.change}%</p>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">Rs {item.value.toLocaleString('en-IN')} this month</p>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Alerts Panel" subtitle="Operational signals generated from the analysis pipeline">
          <div className="space-y-4">
            {analysis.alerts.map((alert, index) => (
              <div key={alert} className={`rounded-2xl border p-4 ${alertStyles[index % alertStyles.length]}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">Alert: {alert}</p>
                  <span className="text-xs font-semibold uppercase tracking-wide">Live</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="AI Explanation" subtitle="Human-readable summary grounded in the structured analysis">
        <div className="rounded-3xl bg-slate-50 p-5 text-sm leading-7 text-slate-700">{analysis.ai_explanation}</div>
      </SectionCard>
    </div>
  )
}
