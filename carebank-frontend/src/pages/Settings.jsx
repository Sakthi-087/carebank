import { SectionCard } from '../components/Cards'

function ToggleRow({ title, description, enabled }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div>
        <p className="font-semibold text-slate-900">{title}</p>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      <div className={`flex h-7 w-12 items-center rounded-full px-1 ${enabled ? 'bg-emerald-500 justify-end' : 'bg-slate-300 justify-start'}`}>
        <span className="h-5 w-5 rounded-full bg-white shadow-sm" />
      </div>
    </div>
  )
}

export default function Settings() {
  return (
    <div className="space-y-6">
      <SectionCard title="AI Provider Settings" subtitle="Configuration guidance for local development">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-700">
          <p><span className="font-semibold text-slate-900">Provider:</span> OpenRouter or OpenAI-compatible API</p>
          <p><span className="font-semibold text-slate-900">Environment variables:</span> <code>OPENROUTER_API_KEY</code>, <code>LLM_PROVIDER</code>, <code>LLM_BASE_URL</code>, <code>LLM_MODEL</code></p>
          <p><span className="font-semibold text-slate-900">Fallback mode:</span> If no API key is set, CareBank automatically uses deterministic explanations and chat replies.</p>
        </div>
      </SectionCard>

      <SectionCard title="Notification Preferences" subtitle="Suggested product settings for alerts and insights">
        <div className="space-y-4">
          <ToggleRow title="Overspending alerts" description="Notify when a category exceeds its recommended range." enabled />
          <ToggleRow title="Weekly wellness summary" description="Receive a weekly recap of health score, risks, and suggestions." enabled />
          <ToggleRow title="AI assistant tips" description="Show proactive prompts when the assistant detects unusual spending patterns." enabled={false} />
        </div>
      </SectionCard>

      <SectionCard title="Data Controls" subtitle="Privacy and demo data information">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-semibold text-slate-900">Current dataset</p>
            <p className="mt-2 text-sm text-slate-500">The PoC uses a local JSON dataset stored in <code>carebank-backend/data/transactions.json</code>.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-semibold text-slate-900">API base URL</p>
            <p className="mt-2 text-sm text-slate-500">Frontend requests can be redirected with the <code>VITE_API_URL</code> environment variable.</p>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}
