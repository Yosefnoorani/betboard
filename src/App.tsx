import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Landing from './pages/Landing'
import Quiz from './pages/Quiz'
import SharedResult from './pages/SharedResult'
import NotFound from './pages/NotFound'
import { useLang } from './lib/i18n'

const AppShell = lazy(() => import('./components/AppShell'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Bets = lazy(() => import('./pages/Bets'))
const ConstitutionPage = lazy(() => import('./pages/Constitution'))
const Record = lazy(() => import('./pages/Record'))
const SharedRecord = lazy(() => import('./pages/SharedRecord'))
const SettingsPage = lazy(() => import('./pages/Settings'))
const Onboarding = lazy(() => import('./pages/Onboarding'))

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  // re-render the whole tree when the language changes (state such as an in-progress quiz is kept)
  useLang()
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<div className="min-h-screen" aria-busy="true" />}>
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
      </Suspense>
    </>
  )
}
