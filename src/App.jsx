import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'

const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'))
const PublicOnlyRoute = lazy(() => import('./components/PublicOnlyRoute'))
const BrowsePage = lazy(() => import('./pages/BrowsePage'))
const CreateListingPage = lazy(() => import('./pages/CreateListingPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const SignupPage = lazy(() => import('./pages/SignupPage'))

function App() {
  return (
    <Layout>
      <Suspense
        fallback={
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
              <p className="text-sm font-medium text-slate-600">Loading page...</p>
            </div>
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Navigate to="/browse" replace />} />

          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/create-listing" element={<CreateListingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/browse" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}

export default App
