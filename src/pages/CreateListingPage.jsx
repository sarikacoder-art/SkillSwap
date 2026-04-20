import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useListings } from '../hooks/useListings'

const initialForm = {
  title: '',
  offering: '',
  seeking: '',
  description: '',
}

function CreateListingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addListing } = useListings()
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onChange = useCallback((event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }, [])

  const onSubmit = useCallback(async (event) => {
    event.preventDefault()
    if (!user) return

    setLoading(true)
    setError('')

    try {
      await addListing(form, user, { refreshAfterCreate: false })
      navigate('/dashboard')
    } catch {
      setError('Could not create listing')
    } finally {
      setLoading(false)
    }
  }, [addListing, form, navigate, user])

  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <p className="text-sm font-medium text-indigo-600">New listing</p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">Create Listing</h1>
      <p className="mt-2 text-sm text-slate-500">Share what you offer and what you are looking for.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div className="space-y-2">
          <label htmlFor="listing-title" className="text-sm font-medium text-slate-700">
            Title
          </label>
          <input
            id="listing-title"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            name="title"
            value={form.title}
            onChange={onChange}
            placeholder="e.g. Weekend Guitar Lessons"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="listing-offering" className="text-sm font-medium text-slate-700">
            What you offer
          </label>
          <input
            id="listing-offering"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            name="offering"
            value={form.offering}
            onChange={onChange}
            placeholder="Skill or service you can provide"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="listing-seeking" className="text-sm font-medium text-slate-700">
            What you seek
          </label>
          <input
            id="listing-seeking"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            name="seeking"
            value={form.seeking}
            onChange={onChange}
            placeholder="Skill or service you need"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="listing-description" className="text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            id="listing-description"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            name="description"
            rows={4}
            value={form.description}
            onChange={onChange}
            placeholder="Add details, availability, and any preferences"
            required
          />
        </div>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:cursor-not-allowed disabled:bg-indigo-300"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Create listing'}
        </button>
      </form>
    </div>
  )
}

export default CreateListingPage
