import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function PublicOnlyRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl p-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
            <p className="text-sm font-medium text-slate-600">Checking session...</p>
          </div>
        </div>
      </div>
    )
  }

  return user ? <Navigate to="/browse" replace /> : <Outlet />
}

export default PublicOnlyRoute
