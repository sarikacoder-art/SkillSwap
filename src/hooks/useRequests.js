import { useCallback, useEffect, useState } from 'react'
import {
  createRequest,
  getRequestsReceived,
  getRequestsSent,
  updateRequestStatus,
} from '../services/requestService'

export function useRequests(user) {
  const [requestsReceived, setRequestsReceived] = useState([])
  const [requestsSent, setRequestsSent] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchRequests = useCallback(async () => {
    if (!user?.uid) {
      setRequestsReceived([])
      setRequestsSent([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')

    try {
      const [received, sent] = await Promise.all([
        getRequestsReceived(user.uid),
        getRequestsSent(user.uid),
      ])
      setRequestsReceived(received)
      setRequestsSent(sent)
    } catch (err) {
      const message = err?.message || err?.code || 'Failed to load requests'
      setError(message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [user?.uid])

  const sendRequest = useCallback(async (payload, options = {}) => {
    const { refreshAfterCreate = false } = options
    setError('')
    try {
      await createRequest(payload)
      if (refreshAfterCreate) {
        await fetchRequests()
      }
      return { ok: true, error: '' }
    } catch (err) {
      const message =
        err?.message || 'Could not send request. Please try again.'
      setError(message)
      return { ok: false, error: message }
    }
  }, [fetchRequests])

  const changeRequestStatus = useCallback(async (requestId, status) => {
    await updateRequestStatus(requestId, status)
    await fetchRequests()
  }, [fetchRequests])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  return {
    requestsReceived,
    requestsSent,
    loading,
    error,
    fetchRequests,
    sendRequest,
    changeRequestStatus,
  }
}
