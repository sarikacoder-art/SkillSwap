import { useState } from 'react'

function toDisplayName(value, fallback = '') {
  if (!value) return fallback
  return String(value).includes('@') ? String(value).split('@')[0] : String(value)
}

function ListingCard({ listing, canRequest, onSendRequest }) {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState('')

  const handleSend = async () => {
    if (!message.trim()) return
    setSending(true)
    setStatus('')

    try {
      const result = await onSendRequest(listing, message.trim())
      if (result?.ok === false) {
        setStatus(result.error || 'Could not send request')
        return
      }
      setMessage('')
      setStatus('Request sent')
    } catch (err) {
      setStatus(err?.message || 'Could not send request')
    } finally {
      setSending(false)
    }
  }

  const statusClass =
    status === 'Request sent' ? 'text-green-600' : 'text-red-600'

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-xl font-bold tracking-tight text-slate-900">{listing.title}</h3>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
          Offering: {listing.offering}
        </span>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          Seeking: {listing.seeking}
        </span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-slate-600">{listing.description}</p>
      <p className="mt-3 text-xs font-medium text-slate-500">
        By {toDisplayName(listing.ownerName, 'User')}{' '}
        {listing.ownerNeighbourhood ? `(${listing.ownerNeighbourhood})` : ''}
      </p>

      {canRequest && (
        <div className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <label className="text-xs font-medium text-slate-600">Send a quick message</label>
          <textarea
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            rows={2}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Send a quick message"
          />
          <button
            disabled={sending}
            onClick={handleSend}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            {sending ? 'Sending...' : 'Send Request'}
          </button>
          {status && <p className={`text-xs font-medium ${statusClass}`}>{status}</p>}
        </div>
      )}
    </article>
  )
}

export default ListingCard
