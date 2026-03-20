import { useEffect, useMemo, useState } from 'react'
import Sidebar from '../components/Sidebar'
import DashboardPage from './DashboardPage'
import Analytics from './Analytics'
import AIAssistant from './AIAssistant'
import Settings from './Settings'
import { fetchAnalysis } from '../services/api'

const routeMeta = {
  dashboard: {
    eyebrow: 'CareBank Dashboard',
    title: 'AI-Powered Financial Wellness System',
    description: 'Analyze spending behavior, surface intelligent alerts, and chat with an AI assistant grounded in your financial data.',
  },
  analytics: {
    eyebrow: 'Analytics Workspace',
    title: 'Spending Trends & Category Intelligence',
    description: 'Explore month-over-month changes, budget utilization, and category-level trend analysis from the agent system.',
  },
  assistant: {
    eyebrow: 'AI Assistant',
    title: 'Conversational Financial Guidance',
    description: 'Ask natural language questions about your behavior, risk, alerts, and savings opportunities.',
  },
  settings: {
    eyebrow: 'Settings',
    title: 'Configure CareBank Preferences',
    description: 'Review AI provider guidance, notification settings, and environment-aware integration details.',
  },
}

function getRouteFromHash() {
  const raw = window.location.hash.replace('#/', '').trim()
  return raw || 'dashboard'
}

export default function Home() {
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [route, setRoute] = useState(getRouteFromHash())

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
    async function load() {
      try {
        const data = await fetchAnalysis()
        setAnalysis(data)
      } catch (err) {
        setError('Unable to load dashboard data. Start the backend and refresh the page.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const pageMeta = routeMeta[route] || routeMeta.dashboard

  const pageContent = useMemo(() => {
    if (!analysis) return null
    if (route === 'analytics') return <Analytics analysis={analysis} />
    if (route === 'assistant') return <AIAssistant analysis={analysis} />
    if (route === 'settings') return <Settings />
    return <DashboardPage analysis={analysis} />
  }, [analysis, route])

  const handleNavigate = (nextRoute) => {
    window.location.hash = `/${nextRoute}`
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[260px_1fr]">
        <Sidebar activeRoute={route} onNavigate={handleNavigate} />

        <section className="space-y-6">
          <header className="rounded-xl border border-slate-200 bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white shadow-md">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-100">{pageMeta.eyebrow}</p>
            <h1 className="mt-3 text-3xl font-bold">{pageMeta.title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-blue-50">{pageMeta.description}</p>
          </header>

          {loading ? (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-md">
              Loading CareBank insights...
            </div>
          ) : error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-10 text-center text-rose-700 shadow-md">
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
