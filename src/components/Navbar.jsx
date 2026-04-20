import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function Navbar() {
  const { user, logout } = useAuth()
  const navItemClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive
        ? 'bg-indigo-100 text-indigo-700'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          to="/browse"
          className="rounded-lg text-4xl font-extrabold tracking-tight text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          SkillSwap
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {user ? (
            <>
              <NavLink className={navItemClass} to="/browse">
                Browse
              </NavLink>
              <NavLink className={navItemClass} to="/create-listing">
                Create Listing
              </NavLink>
              <NavLink className={navItemClass} to="/dashboard">
                Dashboard
              </NavLink>
              <button
                onClick={logout}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink className={navItemClass} to="/login">
                Login
              </NavLink>
              <NavLink className={navItemClass} to="/signup">
                Signup
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}

export default Navbar
