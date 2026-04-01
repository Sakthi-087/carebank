import Chat from '../components/Chat'
import Dashboard from '../components/Dashboard'

export default function DashboardPage({ analysis, financialScore, fraudCheck, accessToken }) {
  return (
    <>
      <Dashboard analysis={analysis} financialScore={financialScore} fraudCheck={fraudCheck} />
      <Chat accessToken={accessToken} />
    </>
  )
}
