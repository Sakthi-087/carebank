import { useEffect, useMemo, useState } from 'react'
import AuthScreen from '../components/AuthScreen'
import Sidebar from '../components/Sidebar'
import DashboardPage from './DashboardPage'
import Analytics from './Analytics'
import AIAssistant from './AIAssistant'
import Settings from './Settings'
import {
  fetchAnalysis,
  fetchFinancialScore,
  fetchFraudCheck,
  fetchHealth,
  fetchPreferences,
  savePreferences,
  uploadTransactionsCsv,
} from '../services/api'
import { requestPasswordReset, restoreSession, signIn, signOut, signUp } from '../services/auth'

const routeMeta = {
  dashboard: {
    eyebrow: 'CareBank Command Center',
    title: 'From transaction history to financial decision intelligence',
    description: 'Track financial health, surface suspicious activity, and keep the strongest signals visible the moment a user signs in.',
  },
  analytics: {
    eyebrow: 'Score & Risk',
    title: 'Explainable financial scoring and safety insights',
    description: 'Break down savings, stability, discipline, risk, and anomaly signals with deterministic metrics that are easy to justify.',
  },
  assistant: {
    eyebrow: 'Decision Lab',
    title: 'Simulate before you spend',
    description: 'Test a planned purchase, project the next 30 days, and combine deterministic modeling with a short AI explanation.',
  },
  settings: {
    eyebrow: 'Data Controls',
    title: 'Manage ingestion, session state, and operational setup',
    description: 'Upload statements, review suspicious transactions, and keep the CareBank pipeline connected to your Supabase project.',
  },
}

function getRouteFromHash() {
  const raw = window.location.hash.replace('#/', '').trim()
  return raw || 'dashboard'
}

export default function Home() {
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [analysis, setAnalysis] = useState(null)
  const [financialScore, setFinancialScore] = useState(null)
  const [fraudCheck, setFraudCheck] = useState({ flagged_transactions: [] })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [authNotice, setAuthNotice] = useState('')
  const [route, setRoute] = useState(getRouteFromHash())
  const [uploading, setUploading] = useState(false)
  const [uploadState, setUploadState] = useState(null)
  const [preferences, setPreferences] = useState({
    overspending_alerts: true,
    weekly_wellness_summary: true,
    ai_assistant_tips: false,
  })
  const [preferencesSaving, setPreferencesSaving] = useState(false)
  const [health, setHealth] = useState(null)

  useEffect(() => {
    function syncRoute() {
      const nextRoute = getRouteFromHash()
      setRoute(routeMeta[nextRoute] ? nextRoute : 'dashboard')
    }

    syncRoute()
    window.addEventListener('hashchange', syncRoute)
    return () => window.removeEventListener('hashchange', syncRoute)
  }, [])

  useEffect(() => {
    async function bootstrapSession() {
      try {
        const { session: restored, notice } = await restoreSession()
        setSession(restored)
        setAuthNotice(notice || '')
      } catch (nextError) {
        setError(nextError.message || 'Unable to restore your session.')
      } finally {
        setAuthLoading(false)
      }
    }

    bootstrapSession()
  }, [])

  async function loadWorkspace(accessToken) {
    setLoading(true)
    setError('')

    try {
      const [analysisData, scoreData, fraudData] = await Promise.all([
        fetchAnalysis(accessToken),
        fetchFinancialScore(accessToken),
        fetchFraudCheck(accessToken),
      ])
      setAnalysis(analysisData)
      setFinancialScore(scoreData)
      setFraudCheck(fraudData)
    } catch (nextError) {
      if (nextError.isAuthError) {
        await signOut(session)
        setSession(null)
        setAuthNotice('Your session expired while loading the dashboard. Please sign in again.')
      }
      setError(nextError.message || 'Unable to load dashboard data.')
      setAnalysis(null)
      setFinancialScore(null)
      setFraudCheck({ flagged_transactions: [] })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!session?.access_token) {
      setAnalysis(null)
      setFinancialScore(null)
      setFraudCheck({ flagged_transactions: [] })
      setLoading(false)
      return
    }

    loadWorkspace(session.access_token)
  }, [session?.access_token])

  useEffect(() => {
    async function loadHealth() {
      try {
        const payload = await fetchHealth()
        setHealth(payload)
      } catch {
        setHealth(null)
      }
    }

    loadHealth()
  }, [])

  useEffect(() => {
    if (!session?.access_token) {
      setPreferences({
        overspending_alerts: true,
        weekly_wellness_summary: true,
        ai_assistant_tips: false,
      })
      return
    }

    async function loadSavedPreferences() {
      try {
        const payload = await fetchPreferences(session.access_token)
        setPreferences(payload.preferences)
      } catch (nextError) {
        if (nextError.isAuthError) {
          await signOut(session)
          setSession(null)
          setAuthNotice('Your session expired while loading preferences. Please sign in again.')
        }
      }
    }

    loadSavedPreferences()
  }, [session?.access_token])

  const pageMeta = routeMeta[route] || routeMeta.dashboard

  const pageContent = useMemo(() => {
    if (route === 'settings') {
      return (
        <Settings
          session={session}
          uploading={uploading}
          uploadState={uploadState}
          fraudCheck={fraudCheck}
          onUpload={handleUpload}
          preferences={preferences}
          preferencesSaving={preferencesSaving}
          onTogglePreference={handleTogglePreference}
          health={health}
        />
      )
    }

    if (!analysis || !financialScore) return null

    if (route === 'analytics') {
      return <Analytics analysis={analysis} financialScore={financialScore} fraudCheck={fraudCheck} />
    }

    if (route === 'assistant') {
      return (
        <AIAssistant
          analysis={analysis}
          financialScore={financialScore}
          fraudCheck={fraudCheck}
          accessToken={session.access_token}
        />
      )
    }

    return (
      <DashboardPage
        analysis={analysis}
        financialScore={financialScore}
        fraudCheck={fraudCheck}
        accessToken={session.access_token}
      />
    )
  }, [analysis, financialScore, fraudCheck, health, preferences, preferencesSaving, route, session, uploading, uploadState])

  const handleNavigate = (nextRoute) => {
    window.location.hash = `/${nextRoute}`
  }

  async function handleSignIn(email, password) {
    const nextSession = await signIn(email, password)
    setSession(nextSession)
    setAuthNotice('')
    return nextSession
  }

  async function handleSignUp(email, password) {
    const result = await signUp(email, password)
    if (result.session) {
      setSession(result.session)
      setAuthNotice('')
    }
    return result
  }

  async function handleSignOut() {
    await signOut(session)
    setSession(null)
    setAnalysis(null)
    setFinancialScore(null)
    setFraudCheck({ flagged_transactions: [] })
    setUploadState(null)
    setAuthNotice('')
  }

  async function handlePasswordReset(email) {
    return requestPasswordReset(email)
  }

  async function handleUpload(file) {
    if (!file || !session?.access_token) return

    setUploading(true)
    setUploadState(null)

    try {
      const result = await uploadTransactionsCsv(file, session.access_token)
      setUploadState({
        tone: 'success',
        message: `Imported ${result.inserted_count} rows. Skipped ${result.skipped_count}.`,
        errors: result.errors,
        fraudSummary: result.fraud_summary || [],
      })
      await loadWorkspace(session.access_token)
    } catch (nextError) {
      setUploadState({
        tone: 'error',
        message: nextError.message || 'CSV upload failed.',
        errors: [],
        fraudSummary: [],
      })
    } finally {
      setUploading(false)
    }
  }

  async function handleTogglePreference(key) {
    if (!session?.access_token || preferencesSaving) return

    const currentPreferences = preferences
    const nextPreferences = {
      ...currentPreferences,
      [key]: !currentPreferences[key],
    }

    setPreferences(nextPreferences)
    setPreferencesSaving(true)

    try {
      const payload = await savePreferences(nextPreferences, session.access_token)
      setPreferences(payload.preferences)
    } catch (nextError) {
      if (nextError.isAuthError) {
        await signOut(session)
        setSession(null)
        setAuthNotice('Your session expired while saving preferences. Please sign in again.')
      }
      setPreferences(currentPreferences)
      setError(nextError.message || 'Unable to save your notification preferences.')
    } finally {
      setPreferencesSaving(false)
    }
  }

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 text-slate-600">
        Restoring your CareBank session...
      </main>
    )
  }

  if (!session) {
    return <AuthScreen onSignIn={handleSignIn} onSignUp={handleSignUp} onResetPassword={handlePasswordReset} notice={authNotice} />
  }

  return (
    <main className="min-h-screen bg-app-shell px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[290px_1fr]">
        <Sidebar activeRoute={route} onNavigate={handleNavigate} session={session} onSignOut={handleSignOut} />

        <section className="space-y-6">
          <header className="overflow-hidden rounded-[28px] border border-slate-200/70 bg-hero-gradient p-6 text-white shadow-2xl shadow-sky-900/10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-100">{pageMeta.eyebrow}</p>
                <h1 className="mt-3 text-3xl font-bold leading-tight lg:text-[2.4rem]">{pageMeta.title}</h1>
                <p className="mt-3 text-sm leading-7 text-blue-50">{pageMeta.description}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-100">Score</p>
                  <p className="mt-1 text-2xl font-bold">{financialScore?.score ?? '--'}</p>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-100">Status</p>
                  <p className="mt-1 text-2xl font-bold">{financialScore?.status || '--'}</p>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-100">Fraud flags</p>
                  <p className="mt-1 text-2xl font-bold">{fraudCheck?.flagged_transactions?.length ?? 0}</p>
                </div>
              </div>
            </div>
          </header>

          {loading ? (
            <div className="rounded-[28px] border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-xl">
              Loading CareBank insights...
            </div>
          ) : error ? (
            <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-10 text-center text-rose-700 shadow-xl">
              {error}
            </div>
          ) : (
            pageContent
          )}
        </section>
      </div>
    </main>
  )
}
