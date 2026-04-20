import { useEffect, useMemo, useRef, useState } from 'react'
import { useMessages } from '../hooks/useMessages'

function toDisplayName(value, fallback = 'User') {
  if (!value) return fallback
  return String(value).includes('@') ? String(value).split('@')[0] : String(value)
}

function MessagingPanel({ request, user }) {
  const [draft, setDraft] = useState('')
  const endRef = useRef(null)
  const { messages, loading, sending, error, postMessage } = useMessages(
    request?.id,
    user
  )

  const otherPersonName = useMemo(() => {
    if (!request || !user) return ''
    if (request.fromUid === user.uid) {
      return toDisplayName(request.toName, 'Other user')
    }
    return toDisplayName(request.fromName, 'Other user')
  }, [request, user])

  if (!request) return null

  useEffect(() => {
    if (!endRef.current) return
    endRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, request?.id])

  const handleSend = async (event) => {
    event.preventDefault()
    if (!draft.trim() || !user?.uid) return

    const toUid =
      request.fromUid === user.uid ? request.toUid : request.fromUid

    const result = await postMessage({
      requestId: request.id,
      fromUid: user.uid,
      toUid,
      text: draft,
    })

    if (result.ok) {
      setDraft('')
    }
  }

  const handleDraftKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (!sending) {
        handleSend(event)
      }
    }
  }

  const formatTime = (value) => {
    if (!value) return ''
    const date =
      typeof value.toDate === 'function'
        ? value.toDate()
        : typeof value.seconds === 'number'
        ? new Date(value.seconds * 1000)
        : null

    if (!date) return ''
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:p-5">
      <h2 className="mb-1 text-xl font-bold tracking-tight text-slate-900">Chat</h2>
      <p className="mb-3 text-sm text-slate-600">
        Regarding: <span className="font-medium">{request.listingTitle || request.listingId}</span>{' '}
        with <span className="font-medium">{otherPersonName}</span>
      </p>

      <div className="mb-3 max-h-64 space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3">
        {loading && <p className="text-sm text-slate-500">Loading messages...</p>}
        {!loading && messages.length === 0 && (
          <p className="text-sm text-slate-500">No messages yet. Start the chat.</p>
        )}
        {messages.map((msg) => {
          const mine = String(msg.fromUid) === String(user?.uid)
          const senderName = mine ? 'You' : otherPersonName
          const timeLabel = formatTime(msg.createdAt)
          return (
            <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                  mine
                    ? 'rounded-br-sm bg-indigo-600 text-white'
                    : 'rounded-bl-sm border border-slate-200 bg-white text-slate-800'
                }`}
              >
                <p className={`mb-1 text-[11px] font-medium ${mine ? 'text-indigo-100' : 'text-gray-500'}`}>
                  {senderName}
                </p>
                <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                {timeLabel && (
                  <p className={`mt-1 text-right text-[10px] ${mine ? 'text-indigo-100' : 'text-gray-400'}`}>
                    {timeLabel}
                  </p>
                )}
              </div>
            </div>
          )
        })}
        <div ref={endRef} />
      </div>

      {error && (
        <p className="mb-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <form onSubmit={handleSend} className="flex gap-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleDraftKeyDown}
          placeholder="Type message..."
          rows={2}
          className="flex-1 resize-none rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
        <button
          disabled={sending}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:cursor-not-allowed disabled:bg-indigo-300"
        >
          {sending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </section>
  )
}

export default MessagingPanel
