import { useCallback, useEffect, useState } from 'react'
import {
  createListing,
  deleteListing,
  getAllListings,
  getListingsByOwner,
  updateListing,
} from '../services/listingService'

export function useListings(ownerUid, refreshKey) {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchListings = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const data = ownerUid
        ? await getListingsByOwner(ownerUid)
        : await getAllListings()
      setListings(data)
    } catch (err) {
      const message = err?.message || err?.code || 'Failed to load listings'
      setError(message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [ownerUid])

  const addListing = useCallback(async (payload, user, options = {}) => {
    const { refreshAfterCreate = false } = options
    const listingId = await createListing(payload, user)

    const optimisticListing = {
      id: listingId,
      ...payload,
      ownerUid: user.uid,
      ownerName: user.displayName || user.email,
      ownerNeighbourhood: user.neighbourhood || '',
    }

    setListings((prev) => [optimisticListing, ...prev])

    if (refreshAfterCreate) {
      await fetchListings()
    }

    return listingId
  }, [fetchListings])

  const editListing = useCallback(async (id, payload, options = {}) => {
    const { refreshAfterUpdate = false } = options
    await updateListing(id, payload)

    setListings((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...payload } : item))
    )

    if (refreshAfterUpdate) {
      await fetchListings()
    }
  }, [fetchListings])

  const removeListing = useCallback(async (id, options = {}) => {
    const { refreshAfterDelete = false } = options
    await deleteListing(id)

    setListings((prev) => prev.filter((item) => item.id !== id))

    if (refreshAfterDelete) {
      await fetchListings()
    }
  }, [fetchListings])

  useEffect(() => {
    fetchListings()
  }, [fetchListings, refreshKey])

  return {
    listings,
    loading,
    error,
    fetchListings,
    addListing,
    editListing,
    removeListing,
  }
}
