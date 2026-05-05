import { HashRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { AppShell } from '@/client/components/layout/AppShell'
import { ErrorBoundary } from '@/client/components/shared/ErrorBoundary'
import { LoadingSpinner } from '@/client/components/shared/LoadingSpinner'
import UnsupportedBrowserPage from '@/client/pages/UnsupportedBrowserPage'
import { DbErrorScreen } from '@/client/components/shared/DbErrorScreen'

const TransactionsPage = lazy(() => import('@/client/pages/TransactionsPage'))
const SettingsPage = lazy(() => import('@/client/pages/SettingsPage'))

function PageLoader() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <LoadingSpinner />
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <ErrorBoundary>
        <DbErrorScreen />
        <AppShell>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<TransactionsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/unsupported" element={<UnsupportedBrowserPage />} />
            </Routes>
          </Suspense>
        </AppShell>
      </ErrorBoundary>
    </HashRouter>
  )
}
