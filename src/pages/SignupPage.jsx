import { Link, useNavigate } from 'react-router-dom'
import { useCallback, useState } from 'react'
import { useAuth } from '../hooks/useAuth'

function getSignupErrorMessage(error) {
  const code = error?.code || ''

  if (code === 'auth/email-already-in-use') {
    return 'This email is already in use.'
  }
  if (code === 'auth/invalid-email') {
    return 'Please enter a valid email address.'
  }
  if (code === 'auth/weak-password') {
    return 'Password must be at least 6 characters.'
  }
  if (code === 'auth/operation-not-allowed') {
    return 'Email/password sign-in is not enabled in Firebase Auth.'
  }
  if (code === 'permission-denied') {
    return 'Firestore permissions blocked profile creation. Check Firestore rules.'
  }

  return error?.message || 'Could not create account.'
}

function SignupPage() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [form, setForm] = useState({
    displayName: '',
    neighbourhood: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onChange = useCallback((event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }, [])

  const onSubmit = useCallback(async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signup(form)
      navigate('/browse')
    } catch (err) {
      setError(getSignupErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [form, navigate, signup])

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <p className="text-sm font-medium text-indigo-600">Create your account</p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">Sign Up</h1>
      <p className="mt-2 text-sm text-slate-500">Join your local skill swap network in minutes.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
        <div className="space-y-2">
          <label htmlFor="signup-displayName" className="text-sm font-medium text-slate-700">
            Display name
          </label>
          <input
            id="signup-displayName"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            name="displayName"
            value={form.displayName}
            onChange={onChange}
            placeholder="Your name"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="signup-neighbourhood" className="text-sm font-medium text-slate-700">
            Neighbourhood
          </label>
          <input
            id="signup-neighbourhood"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            name="neighbourhood"
            value={form.neighbourhood}
            onChange={onChange}
            placeholder="e.g. Downtown"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="signup-email" className="text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="signup-email"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="signup-password" className="text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            id="signup-password"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            placeholder="At least 6 characters"
            required
            minLength={6}
          />
        </div>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          disabled={loading}
          className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:cursor-not-allowed disabled:bg-indigo-300"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="mt-5 text-sm text-slate-600">
        Already have an account?{' '}
        <Link className="font-medium text-indigo-600 hover:text-indigo-500" to="/login">
          Login
        </Link>
      </p>
    </div>
  )
}

export default SignupPage
