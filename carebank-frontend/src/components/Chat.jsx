import { useState } from 'react'
import { sendChat } from '../services/api'
import { SectionCard } from './Cards'

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! Ask why your spending increased, what your biggest risk is, or how to save more this month.',
    },
  ])
  const [input, setInput] = useState('Why did I spend more this month?')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!input.trim() || loading) return

    const nextMessage = { role: 'user', content: input.trim() }
    setMessages((current) => [...current, nextMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await sendChat(nextMessage.content)
      setMessages((current) => [...current, { role: 'assistant', content: response.answer }])
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: 'The backend could not be reached. Please start the API server and try again.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <SectionCard title="Chat Assistant" subtitle="Agentic AI + generative AI in a conversational interface">
      <div className="space-y-4">
        <div className="max-h-[26rem] space-y-3 overflow-y-auto rounded-xl bg-slate-50 p-4">
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                  message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Why did I spend more this month?"
            className="min-h-12 flex-1 rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </SectionCard>
  )
}
