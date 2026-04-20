function RequestCard({
  request,
  isOwner = false,
  onUpdateStatus,
  onOpenChat,
  incomingMessageCount = 0,
}) {
  const toDisplayName = (value, fallback = 'User') => {
    if (!value) return fallback
    return String(value).includes('@') ? String(value).split('@')[0] : String(value)
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-slate-800">
        Listing: {request.listingTitle || request.listingId}
      </p>
      <p className="mt-1 text-sm text-slate-600">
        From: {toDisplayName(request.fromName, request.fromUid)}
      </p>
      <p className="text-sm text-slate-600">
        To: {toDisplayName(request.toName, request.toUid)}
      </p>
      <p className="mt-1 text-sm text-slate-600">Message: {request.message}</p>
      <p className="mt-1 text-sm text-slate-700">
        Status:{' '}
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
            request.status === 'accepted'
              ? 'bg-emerald-50 text-emerald-700'
              : request.status === 'declined'
              ? 'bg-rose-50 text-rose-700'
              : 'bg-amber-50 text-amber-700'
          }`}
        >
          {request.status}
        </span>
      </p>

      {isOwner && request.status === 'pending' && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => onUpdateStatus(request.id, 'accepted')}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            Accept
          </button>
          <button
            onClick={() => onUpdateStatus(request.id, 'declined')}
            className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-rose-500"
          >
            Decline
          </button>
        </div>
      )}

      <div className="mt-3">
        <button
          type="button"
          onClick={() => onOpenChat?.(request)}
          className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100"
        >
          Open Chat
          {incomingMessageCount > 0 && (
            <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-xs text-white">
              {incomingMessageCount}
            </span>
          )}
        </button>
      </div>
    </div>
  )
}

export default RequestCard
