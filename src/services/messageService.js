import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore/lite'
import { db } from './firestore'

const messagesCollection = collection(db, 'messages')

function getTimestampValue(value) {
  if (!value) return 0
  if (typeof value.toMillis === 'function') return value.toMillis()
  if (typeof value.seconds === 'number') return value.seconds * 1000
  return 0
}

function sortByOldest(messages) {
  return [...messages].sort(
    (a, b) => getTimestampValue(a.createdAt) - getTimestampValue(b.createdAt)
  )
}

export async function sendMessage({ requestId, fromUid, toUid, text }) {
  if (!text?.trim()) {
    throw new Error('Message cannot be empty')
  }

  const docRef = await addDoc(messagesCollection, {
    requestId,
    fromUid,
    toUid,
    text: text.trim(),
    createdAt: serverTimestamp(),
  })

  return docRef.id
}

export async function getMessagesByRequest(requestId, userUid) {
  if (!requestId || !userUid) return []

  const fromQuery = query(
    messagesCollection,
    where('requestId', '==', requestId),
    where('fromUid', '==', userUid)
  )
  const toQuery = query(
    messagesCollection,
    where('requestId', '==', requestId),
    where('toUid', '==', userUid)
  )

  const [fromSnap, toSnap] = await Promise.all([
    getDocs(fromQuery),
    getDocs(toQuery),
  ])

  const merged = new Map()
  ;[...fromSnap.docs, ...toSnap.docs].forEach((item) => {
    merged.set(item.id, {
      id: item.id,
      ...item.data(),
    })
  })

  return sortByOldest(Array.from(merged.values()))
}

export async function getIncomingMessageCounts(userUid) {
  if (!userUid) return {}

  const q = query(messagesCollection, where('toUid', '==', userUid))
  const snap = await getDocs(q)

  const counts = {}
  snap.docs.forEach((item) => {
    const data = item.data()
    const requestId = data.requestId
    if (!requestId) return
    counts[requestId] = (counts[requestId] || 0) + 1
  })

  return counts
}
