import { useEffect, useState } from 'react'
import Chat from '../components/Chat'
import Dashboard from '../components/Dashboard'
import Sidebar from '../components/Sidebar'
import { fetchAnalysis } from '../services/api'

export default function Home() {
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[260px_1fr]">
        <Sidebar />

        <section className="space-y-6">
          <header className="rounded-xl border border-slate-200 bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white shadow-md">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-100">CareBank Dashboard</p>
            <h1 className="mt-3 text-3xl font-bold">AI-Powered Financial Wellness System</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-blue-50">
              Analyze spending behavior, surface intelligent alerts, and chat with an AI assistant grounded in your financial data.
            </p>
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
            <>
              <Dashboard analysis={analysis} />
              <Chat />
            </>
          )}
        </section>
      </div>
    </main>
  )
}
