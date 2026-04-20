import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useListings } from '../hooks/useListings'
import { useRequests } from '../hooks/useRequests'
import ListingEditor from '../components/ListingEditor'
import MessagingPanel from '../components/MessagingPanel'
import RequestCard from '../components/RequestCard'
import { getIncomingMessageCounts } from '../services/messageService'

function DashboardPage() {
  const { user } = useAuth()
  const { listings, loading: listingsLoading, removeListing, editListing } = useListings(user?.uid)
  const {
    requestsReceived,
    requestsSent,
    loading: requestsLoading,
    error: requestsError,
    changeRequestStatus,
  } = useRequests(user)

  const [editingId, setEditingId] = useState('')
  const [activeChatRequestId, setActiveChatRequestId] = useState('')
  const [incomingCounts, setIncomingCounts] = useState({})

  const pendingCount = useMemo(
    () => requestsReceived.filter((item) => item.status === 'pending').length,
    [requestsReceived]
  )
  const allRequests = useMemo(
    () => [...requestsReceived, ...requestsSent],
    [requestsReceived, requestsSent]
  )
  const activeChatRequest = useMemo(
    () => allRequests.find((item) => item.id === activeChatRequestId) || null,
    [allRequests, activeChatRequestId]
  )

  const onDelete = useCallback(async (id) => {
    await removeListing(id)
  }, [removeListing])

  const onSaveEdit = useCallback(async (id, payload) => {
    await editListing(id, payload)
    setEditingId('')
  }, [editListing])

  useEffect(() => {
    if (!user?.uid) {
      setIncomingCounts({})
      return
    }

    let mounted = true
    const loadCounts = async () => {
      try {
        const counts = await getIncomingMessageCounts(user.uid)
        if (mounted) {
          setIncomingCounts(counts)
        }
      } catch (err) {
        console.error('Failed to load message counts', err)
      }
    }

    loadCounts()
    const timer = setInterval(loadCounts, 5000)

    return () => {
      mounted = false
      clearInterval(timer)
    }
  }, [user?.uid, requestsReceived, requestsSent])

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your listings, requests, and chat threads.</p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">My Listings</h2>
        </div>

        {listingsLoading && (
          <div className="space-y-3">
            {[1, 2].map((item) => (
              <div key={item} className="h-32 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
            ))}
          </div>
        )}
        {!listingsLoading && listings.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <p className="text-sm font-medium text-slate-600">You have no listings yet.</p>
          </div>
        )}

        <div className="space-y-3">
          {listings.map((item) => (
            <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-4">
              {editingId === item.id ? (
                <ListingEditor
                  listing={item}
                  onCancel={() => setEditingId('')}
                  onSave={(payload) => onSaveEdit(item.id, payload)}
                />
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                      Offering: {item.offering}
                    </span>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Seeking: {item.seeking}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{item.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => setEditingId(item.id)}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-xl font-bold tracking-tight text-slate-900">
          Requests Received ({pendingCount} pending)
        </h2>
        {requestsLoading && <p className="text-sm text-slate-500">Loading received requests...</p>}
        {requestsError && (
          <p className="mb-2 rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-red-700">
            {requestsError}
          </p>
        )}
        {!requestsLoading && requestsReceived.length === 0 && (
          <p className="text-sm text-slate-500">No requests received yet.</p>
        )}
        <div className="space-y-3">
          {requestsReceived.map((req) => (
            <RequestCard
              key={req.id}
              request={req}
              isOwner
              onUpdateStatus={changeRequestStatus}
              onOpenChat={(request) => setActiveChatRequestId(request.id)}
              incomingMessageCount={incomingCounts[req.id] || 0}
            />
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-xl font-bold tracking-tight text-slate-900">Requests Sent</h2>
        {requestsLoading && <p className="text-sm text-slate-500">Loading sent requests...</p>}
        {requestsError && (
          <p className="mb-2 rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-red-700">
            {requestsError}
          </p>
        )}
        {!requestsLoading && requestsSent.length === 0 && (
          <p className="text-sm text-slate-500">No requests sent yet.</p>
        )}
        <div className="space-y-3">
          {requestsSent.map((req) => (
            <RequestCard
              key={req.id}
              request={req}
              onOpenChat={(request) => setActiveChatRequestId(request.id)}
              incomingMessageCount={incomingCounts[req.id] || 0}
            />
          ))}
        </div>
      </section>

      {activeChatRequest && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl">
            <div className="mb-2 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveChatRequestId('')}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Close
              </button>
            </div>
            <MessagingPanel request={activeChatRequest} user={user} />
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardPage
