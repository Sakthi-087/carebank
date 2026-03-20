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
    async function loadAnalysis() {
      try {
        const payload = await fetchAnalysis()
        setAnalysis(payload)
      } catch (err) {
        setError('Unable to load financial analysis. Start the backend API and refresh the page.')
      } finally {
        setLoading(false)
      }
    }

    loadAnalysis()
  }, [])

  return (
    <main className="min-h-screen px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[300px_1fr]">
        <Sidebar />

        <section className="space-y-6">
          <header className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">AI-Powered Financial Wellness</p>
            <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-3xl font-semibold text-white">Smart monitoring for healthier money habits</h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
                  Multi-agent analytics categorize transactions, score financial health, trigger alerts, and explain next steps with generative AI.
                </p>
              </div>
            </div>
          </header>

          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-slate-300 backdrop-blur-xl">
              Loading your financial wellness dashboard...
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-rose-400/20 bg-rose-500/10 p-10 text-center text-rose-100 backdrop-blur-xl">
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
