import { useState } from 'react'
import { SectionCard } from '../components/Cards'

function ToggleRow({ title, description, enabled, onToggle, disabled }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-70"
    >
      <div>
        <p className="font-semibold text-slate-900">{title}</p>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      <div className={`flex h-7 w-12 items-center rounded-full px-1 ${enabled ? 'justify-end bg-emerald-500' : 'justify-start bg-slate-300'}`}>
        <span className="h-5 w-5 rounded-full bg-white shadow-sm" />
      </div>
    </button>
  )
}

export default function Settings({
  session,
  uploading,
  uploadState,
  fraudCheck,
  onUpload,
  preferences,
  preferencesSaving,
  onTogglePreference,
  health,
}) {
  const [file, setFile] = useState(null)

  function handleSubmit(event) {
    event.preventDefault()
    if (!file) return
    onUpload(file)
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SectionCard title="Session & Environment" subtitle="Operational context for the current user session">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-700">
            <p><span className="font-semibold text-slate-900">User:</span> {session?.user?.email || 'Unknown'}</p>
            <p><span className="font-semibold text-slate-900">Backend auth:</span> Protected routes verify your Supabase bearer token before accessing transaction data.</p>
            <p><span className="font-semibold text-slate-900">Frontend env:</span> <code>VITE_SUPABASE_URL</code>, <code>VITE_SUPABASE_ANON_KEY</code>, <code>VITE_API_URL</code></p>
            <p><span className="font-semibold text-slate-900">Health:</span> {health ? (health.sample_data_fallback_enabled ? 'Sample fallback enabled.' : 'Live-only mode.') : 'Unavailable.'}</p>
            <p><span className="font-semibold text-slate-900">LLM:</span> {health?.llm_configured ? 'Configured' : 'Fallback-only mode'}</p>
          </div>
        </SectionCard>

        <SectionCard title="Safety Snapshot" subtitle="Recent anomaly detections available for demo and review">
          {fraudCheck?.flagged_transactions?.length ? (
            <div className="space-y-3">
              {fraudCheck.flagged_transactions.slice(0, 3).map((item) => (
                <div key={`${item.description}-${item.amount}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-900">{item.description}</p>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.risk === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>{item.risk}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">Rs {Number(item.amount).toLocaleString('en-IN')}</p>
                  <p className="mt-2 text-sm text-slate-600">{item.flags.join(', ')}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
              No suspicious transactions are currently flagged.
            </div>
          )}
        </SectionCard>
      </div>

      <SectionCard title="CSV Ingestion" subtitle="Upload a bank or wallet export directly into the CareBank pipeline">
        <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
            className="block w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700"
          />
          <button
            type="submit"
            disabled={!file || uploading}
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {uploading ? 'Uploading...' : 'Upload CSV'}
          </button>
        </form>

        {uploadState ? (
          <div className={`mt-4 rounded-2xl border p-4 text-sm ${uploadState.tone === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
            <p className="font-semibold">{uploadState.message}</p>
            {uploadState.errors?.length ? (
              <div className="mt-3 space-y-1">
                {uploadState.errors.slice(0, 5).map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            ) : null}
            {uploadState.fraudSummary?.length ? (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
                <p className="font-semibold">Suspicious transactions detected</p>
                <div className="mt-3 space-y-2">
                  {uploadState.fraudSummary.slice(0, 5).map((item) => (
                    <div key={`${item.description}-${item.amount}`} className="rounded-xl bg-white/60 px-3 py-2">
                      <p className="font-medium">{item.description} - Rs {Number(item.amount).toLocaleString('en-IN')}</p>
                      <p className="text-xs uppercase tracking-wide">{item.risk} risk</p>
                      <p className="mt-1 text-xs">{item.flags.join(', ')}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </SectionCard>

      <SectionCard title="Notification Preferences" subtitle="Suggested operating defaults for the product">
        <div className="space-y-4">
          <ToggleRow
            title="Overspending alerts"
            description="Notify when a category exceeds its recommended range."
            enabled={preferences.overspending_alerts}
            onToggle={() => onTogglePreference('overspending_alerts')}
            disabled={preferencesSaving}
          />
          <ToggleRow
            title="Weekly wellness summary"
            description="Receive a weekly recap of health score, risks, and suggestions."
            enabled={preferences.weekly_wellness_summary}
            onToggle={() => onTogglePreference('weekly_wellness_summary')}
            disabled={preferencesSaving}
          />
          <ToggleRow
            title="AI assistant tips"
            description="Show proactive prompts when the assistant detects unusual spending patterns."
            enabled={preferences.ai_assistant_tips}
            onToggle={() => onTogglePreference('ai_assistant_tips')}
            disabled={preferencesSaving}
          />
          {preferencesSaving ? <p className="text-sm text-slate-500">Saving your preferences...</p> : null}
        </div>
      </SectionCard>
    </div>
  )
}
