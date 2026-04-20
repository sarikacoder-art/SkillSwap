import { useMemo, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useListings } from '../hooks/useListings'
import { useRequests } from '../hooks/useRequests'
import ListingCard from '../components/ListingCard'

function BrowsePage() {
  const { user } = useAuth()
  const { listings, loading, error } = useListings(null, user?.uid)
  const { sendRequest } = useRequests(null)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const value = query.toLowerCase().trim()
    if (!value) return listings

    return listings.filter((item) => {
      return (
        item.title?.toLowerCase().includes(value) ||
        item.offering?.toLowerCase().includes(value) ||
        item.seeking?.toLowerCase().includes(value)
      )
    })
  }, [listings, query])

  const onSendRequest = async (listing, message) => {
    if (!user) return
    return sendRequest(
      {
        listingId: listing.id,
        listingTitle: listing.title,
        fromUid: user.uid,
        fromName: user.displayName || user.email,
        toUid: listing.ownerUid,
        toName: listing.ownerName || '',
        message,
      },
      { refreshAfterCreate: false }
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Browse Listings
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Discover offers and find a local skill exchange.
            </p>
          </div>

          <div className="w-full sm:max-w-xs">
            <label htmlFor="listing-search" className="mb-2 block text-sm font-medium text-slate-700">
              Search
            </label>
            <input
              id="listing-search"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              placeholder="Search listings"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading && (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="h-56 animate-pulse rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            />
          ))}
        </div>
      )}
      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-slate-700">No listings found</p>
          <p className="mt-1 text-sm text-slate-500">Try changing your search or check back later.</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            canRequest={Boolean(user && user.uid !== listing.ownerUid)}
            onSendRequest={onSendRequest}
          />
        ))}
      </div>
    </div>
  )
}

export default BrowsePage
