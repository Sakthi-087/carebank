import { SectionCard } from '../components/Cards'

function MetricCard({ title, value, subtitle, tone = 'slate' }) {
  const tones = {
    cyan: 'border-cyan-200 bg-cyan-50 text-cyan-800',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    amber: 'border-amber-200 bg-amber-50 text-amber-800',
    slate: 'border-slate-200 bg-slate-50 text-slate-800',
  }

  return (
    <div className={`rounded-2xl border p-5 ${tones[tone] || tones.slate}`}>
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-3 text-3xl font-bold">{value}</p>
      <p className="mt-2 text-sm opacity-80">{subtitle}</p>
    </div>
  )
}

export default function Analytics({ analysis, financialScore, fraudCheck }) {
  const metrics = financialScore.metrics
  const flaggedTransactions = fraudCheck?.flagged_transactions || []

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Savings Ratio" value={`${(metrics.savings_ratio * 100).toFixed(0)}%`} subtitle="Share of income left after expenses" tone="cyan" />
        <MetricCard title="Expense Ratio" value={`${(metrics.expense_ratio * 100).toFixed(0)}%`} subtitle="Projected expense load versus income" tone="amber" />
        <MetricCard title="Volatility" value={`Rs ${metrics.expense_volatility.toLocaleString('en-IN')}`} subtitle="Daily expense standard deviation" tone="slate" />
        <MetricCard title="Flagged Transactions" value={String(flaggedTransactions.length)} subtitle="Medium/high anomaly detections" tone="emerald" />
      </div>

      <SectionCard title="Scoring Breakdown" subtitle="Weighted components used in the financial score">
        <div className="grid gap-4 lg:grid-cols-2">
          {Object.entries(financialScore.breakdown).map(([key, value]) => (
            <div key={key} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold capitalize text-slate-900">{key.replace('_', ' ')}</p>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
              </div>
              <div className="mt-4 h-3 rounded-full bg-slate-200">
                <div className="h-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-700" style={{ width: `${value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Decision Metrics" subtitle="The deterministic values the backend uses for explainable reasoning">
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 bg-white text-left text-sm">
            <tbody className="divide-y divide-slate-200 text-slate-700">
              <tr><td className="px-4 py-4 font-semibold text-slate-900">Income</td><td className="px-4 py-4">Rs {metrics.income.toLocaleString('en-IN')}</td></tr>
              <tr><td className="px-4 py-4 font-semibold text-slate-900">Expenses</td><td className="px-4 py-4">Rs {metrics.expenses.toLocaleString('en-IN')}</td></tr>
              <tr><td className="px-4 py-4 font-semibold text-slate-900">High-value expense count</td><td className="px-4 py-4">{metrics.high_value_expense_count}</td></tr>
              <tr><td className="px-4 py-4 font-semibold text-slate-900">Impulse spend count</td><td className="px-4 py-4">{metrics.impulse_spend_count}</td></tr>
              <tr><td className="px-4 py-4 font-semibold text-slate-900">Net balance trend</td><td className="px-4 py-4">Rs {metrics.net_balance_trend.toLocaleString('en-IN')}</td></tr>
              <tr><td className="px-4 py-4 font-semibold text-slate-900">Current month</td><td className="px-4 py-4">{analysis.insights.current_month || 'N/A'}</td></tr>
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard title="Fraud Review" subtitle="Lightweight anomaly detection that adds a fintech-style safety layer">
        {flaggedTransactions.length ? (
          <div className="space-y-3">
            {flaggedTransactions.map((item) => (
              <div key={`${item.description}-${item.amount}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{item.description}</p>
                    <p className="mt-1 text-sm text-slate-500">Rs {Number(item.amount).toLocaleString('en-IN')}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.risk === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                    {item.risk}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-600">{item.flags.join(', ')}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-800">
            No suspicious transactions were detected in the current transaction history.
          </div>
        )}
      </SectionCard>
    </div>
  )
}
