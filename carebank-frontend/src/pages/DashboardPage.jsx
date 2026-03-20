import Chat from '../components/Chat'
import Dashboard from '../components/Dashboard'

export default function DashboardPage({ analysis }) {
  return (
    <>
      <Dashboard analysis={analysis} />
      <Chat />
    </>
  )
}
