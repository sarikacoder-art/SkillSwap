import { useCallback, useEffect, useState } from 'react'
import { getMessagesByRequest, sendMessage } from '../services/messageService'

export function useMessages(requestId, user) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const fetchMessages = useCallback(async () => {
    if (!requestId || !user?.uid) {
      setMessages([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')
    try {
      const data = await getMessagesByRequest(requestId, user.uid)
      setMessages(data)
    } catch (err) {
      setError(err?.message || 'Failed to load messages')
    } finally {
      setLoading(false)
    }
  }, [requestId, user?.uid])

  const postMessage = useCallback(async (payload) => {
    setSending(true)
    setError('')
    try {
      await sendMessage(payload)
      await fetchMessages()
      return { ok: true }
    } catch (err) {
      const message = err?.message || 'Failed to send message'
      setError(message)
      return { ok: false, error: message }
    } finally {
      setSending(false)
    }
  }, [fetchMessages])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  useEffect(() => {
    if (!requestId || !user?.uid) return

    const timer = setInterval(() => {
      fetchMessages()
    }, 4000)

    return () => clearInterval(timer)
  }, [fetchMessages, requestId, user?.uid])

  return {
    messages,
    loading,
    sending,
    error,
    fetchMessages,
    postMessage,
  }
}
