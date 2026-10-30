import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Landing from './pages/Landing'
import Quiz from './pages/Quiz'
import SharedResult from './pages/SharedResult'
import AppShell from './components/AppShell'
import Dashboard from './pages/Dashboard'
import Bets from './pages/Bets'
import ConstitutionPage from './pages/Constitution'
import Record from './pages/Record'
import SharedRecord from './pages/SharedRecord'
import SettingsPage from './pages/Settings'
import NotFound from './pages/NotFound'
import Onboarding from './pages/Onboarding'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/test" element={<Quiz />} />
        <Route path="/start" element={<Onboarding />} />
        <Route path="/s/:data" element={<SharedResult />} />
        <Route path="/c/:data" element={<SharedResult mode="challenge" />} />
        <Route path="/r/:data" element={<SharedRecord />} />
        <Route path="/app" element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route path="bets" element={<Bets />} />
          <Route path="constitution" element={<ConstitutionPage />} />
          <Route path="record" element={<Record />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="/pricing" element={<Landing scrollTo="pricing" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}
