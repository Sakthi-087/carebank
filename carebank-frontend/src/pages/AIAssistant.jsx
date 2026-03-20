import Chat from '../components/Chat'
import { SectionCard } from '../components/Cards'

const prompts = [
  'Why did I spend more this month?',
  'Which category should I reduce first?',
  'How can I improve my savings rate?',
  'What does my risk indicator mean?',
]

export default function AIAssistant({ analysis }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SectionCard title="Suggested Questions" subtitle="Prompt ideas for the financial assistant">
          <div className="space-y-3">
            {prompts.map((prompt) => (
              <div key={prompt} className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm font-medium text-blue-900">
                {prompt}
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Assistant Context" subtitle="What the AI is currently using to answer questions">
          <div className="space-y-4 text-sm text-slate-700">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">Top financial summary</p>
              <p className="mt-2">Score: {analysis.financial_health.score} ({analysis.financial_health.status})</p>
              <p className="mt-1">Monthly spend: ₹{analysis.spending.total.toLocaleString('en-IN')}</p>
              <p className="mt-1">Largest category: {analysis.spending.largest_category}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">Live alerts</p>
              <ul className="mt-2 space-y-2">
                {analysis.alerts.map((alert) => (
                  <li key={alert}>• {alert}</li>
                ))}
              </ul>
            </div>
          </div>
        </SectionCard>
      </div>

      <Chat />
    </div>
  )
}
