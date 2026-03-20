import { SectionCard } from '../components/Cards'

function TrendCard({ title, value, subtitle, tone = 'slate' }) {
  const tones = {
    blue: 'border-blue-200 bg-blue-50 text-blue-800',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    amber: 'border-amber-200 bg-amber-50 text-amber-800',
    slate: 'border-slate-200 bg-slate-50 text-slate-800',
  }

  return (
    <div className={`rounded-xl border p-5 ${tones[tone] || tones.slate}`}>
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-3 text-3xl font-bold">{value}</p>
      <p className="mt-2 text-sm opacity-80">{subtitle}</p>
    </div>
  )
}

export default function Analytics({ analysis }) {
  const { spending, chart_data: chartData, insights, alerts } = analysis
  const fastestGrowing = [...chartData].sort((left, right) => right.change - left.change)[0]
  const highestSpend = [...chartData].sort((left, right) => right.value - left.value)[0]

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <TrendCard title="Current Month" value={insights.current_month} subtitle="Analysis period" tone="blue" />
        <TrendCard title="Highest Spend" value={highestSpend.name} subtitle={`₹${highestSpend.value.toLocaleString('en-IN')}`} tone="amber" />
        <TrendCard title="Fastest Growth" value={`${fastestGrowing.change >= 0 ? '+' : ''}${fastestGrowing.change}%`} subtitle={fastestGrowing.name} tone="emerald" />
        <TrendCard title="Alert Count" value={String(alerts.length)} subtitle="Active intelligence signals" tone="slate" />
      </div>

      <SectionCard title="Category Trend Analytics" subtitle="Current month vs previous month by category">
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 bg-white text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Current</th>
                <th className="px-4 py-3 font-semibold">Previous</th>
                <th className="px-4 py-3 font-semibold">Change</th>
                <th className="px-4 py-3 font-semibold">Insight</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {chartData.map((item) => (
                <tr key={item.name}>
                  <td className="px-4 py-4 font-semibold text-slate-900">{item.name}</td>
                  <td className="px-4 py-4">₹{item.value.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-4">₹{item.previous.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-4">{item.change >= 0 ? '+' : ''}{item.change}%</td>
                  <td className="px-4 py-4">
                    {item.change > 20
                      ? 'Spending acceleration detected'
                      : item.change < 0
                        ? 'Spend reduced versus last month'
                        : 'Stable spending pattern'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard title="Budget Utilization" subtitle="Simple rule-based budget monitoring">
        <div className="grid gap-4 lg:grid-cols-2">
          {chartData.map((item) => {
            const limit = item.name === 'Food' ? 3000 : item.name === 'Shopping' ? 2000 : item.name === 'Travel' ? 1000 : 3500
            const usage = Math.min((item.value / limit) * 100, 100)
            return (
              <div key={item.name} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-900">{item.name}</p>
                  <p className="text-sm text-slate-500">₹{item.value.toLocaleString('en-IN')} / ₹{limit.toLocaleString('en-IN')}</p>
                </div>
                <div className="mt-4 h-3 rounded-full bg-slate-200">
                  <div
                    className={`h-3 rounded-full ${usage >= 90 ? 'bg-rose-500' : usage >= 75 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${usage}%` }}
                  />
                </div>
                <p className="mt-3 text-sm text-slate-500">{usage.toFixed(0)}% of recommended cap used.</p>
              </div>
            )
          })}
        </div>
      </SectionCard>
    </div>
  )
}
