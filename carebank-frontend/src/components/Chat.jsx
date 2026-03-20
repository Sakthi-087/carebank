import { useState } from 'react'
import { sendChat } from '../services/api'
import { Panel } from './Cards'

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi, I am your CareBank assistant. Ask me why your spending changed or how to improve your budget.',
    },
  ])
  const [input, setInput] = useState('Why did I spend more this month?')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!input.trim() || loading) {
      return
    }

    const userMessage = { role: 'user', content: input.trim() }
    setMessages((current) => [...current, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await sendChat(userMessage.content)
      setMessages((current) => [...current, { role: 'assistant', content: response.answer }])
    } catch (error) {
      setMessages((current) => [
        ...current,
        { role: 'assistant', content: 'I could not reach the backend right now. Please verify that the API is running.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Panel title="Chat Assistant" subtitle="Ask natural-language questions about your finances">
      <div className="space-y-4">
        <div className="max-h-[24rem] space-y-3 overflow-y-auto pr-2">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`rounded-2xl p-4 text-sm leading-6 ${
                message.role === 'assistant'
                  ? 'bg-slate-950/60 text-slate-100'
                  : 'ml-auto bg-emerald-500/20 text-emerald-50'
              }`}
            >
              {message.content}
            </div>
          ))}
        </div>

        <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about your spending trends..."
            className="min-h-14 flex-1 rounded-2xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/50"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Thinking...' : 'Send'}
          </button>
        </form>
      </div>
    </Panel>
  )
}
