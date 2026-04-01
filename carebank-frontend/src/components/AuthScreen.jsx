import { useState } from 'react'

export default function AuthScreen({ onSignIn, onSignUp, onResetPassword, notice }) {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const submitLabel = mode === 'signin' ? 'Enter CareBank' : 'Create CareBank Account'
  const modeTitle = mode === 'signin' ? 'Welcome back to your financial workspace' : 'Create your secure CareBank workspace'
  const modeDescription =
    mode === 'signin'
      ? 'Sign in to review your latest spending signals, upload fresh statements, and continue from your last financial check-in.'
      : 'Create an account to start importing statements, tracking your health score, and using AI-assisted decision support.'

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      if (mode === 'signin') {
        await onSignIn(email, password)
      } else {
        const result = await onSignUp(email, password)
        if (result?.message) {
          setMessage(result.message)
        }
      }
    } catch (nextError) {
      setError(nextError.message || 'Authentication failed.')
    } finally {
      setLoading(false)
    }
  }

  async function handlePasswordReset() {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const nextMessage = await onResetPassword(email)
      setMessage(nextMessage)
    } catch (nextError) {
      setError(nextError.message || 'Unable to request a password reset.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 p-8 text-white shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-100">CareBank Secure Workspace</p>
          <h1 className="mt-6 max-w-2xl text-4xl font-bold leading-tight">Track your money with a workspace built for statement imports, risk checks, and confident financial decisions.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-50">
            CareBank keeps your dashboard, AI assistant, and imported transactions tied to your account so every insight reflects your own financial activity.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-sm font-semibold">Private money view</p>
              <p className="mt-2 text-sm text-blue-50">Your profile, imported statements, and spending insights stay scoped to your account.</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-sm font-semibold">Statement imports</p>
              <p className="mt-2 text-sm text-blue-50">Upload bank or wallet exports and refresh your CareBank view in minutes.</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-sm font-semibold">Protected insights</p>
              <p className="mt-2 text-sm text-blue-50">Only authenticated sessions can access analysis, scoring, simulation, and transaction actions.</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
          <div className="flex gap-2 rounded-2xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold ${mode === 'signin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold ${mode === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{modeTitle}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{modeDescription}</p>
            </div>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                placeholder="name@example.com"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={6}
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                placeholder="At least 6 characters"
              />
            </label>

            {notice ? <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{notice}</div> : null}
            {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
            {message ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? 'Please wait...' : submitLabel}
            </button>

            {mode === 'signin' ? (
              <button
                type="button"
                onClick={handlePasswordReset}
                disabled={loading}
                className="w-full rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                Email Reset Link
              </button>
            ) : null}
          </form>
        </section>
      </div>
    </main>
  )
}
