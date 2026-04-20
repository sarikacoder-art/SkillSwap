import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore/lite'
import { db } from './firestore'
import { getUserDisplayNameMap } from './userService'

const requestsCollection = collection(db, 'requests')

function getTimestampValue(value) {
  if (!value) return 0
  if (typeof value.toMillis === 'function') return value.toMillis()
  if (typeof value.seconds === 'number') return value.seconds * 1000
  return 0
}

function sortByNewest(requests) {
  return [...requests].sort(
    (a, b) => getTimestampValue(b.createdAt) - getTimestampValue(a.createdAt)
  )
}

async function hydrateRequestNames(requests) {
  const uids = requests.flatMap((item) => [item.fromUid, item.toUid])
  const nameMap = await getUserDisplayNameMap(uids)

  return requests.map((item) => ({
    ...item,
    fromName: nameMap[item.fromUid] || item.fromName || item.fromUid,
    toName: nameMap[item.toUid] || item.toName || item.toUid,
  }))
}

export async function createRequest({
  listingId,
  listingTitle,
  fromUid,
  fromName,
  toUid,
  toName,
  message,
}) {
  const duplicateQuery = query(
    requestsCollection,
    where('listingId', '==', listingId),
    where('fromUid', '==', fromUid),
    where('status', '==', 'pending')
  )
  const duplicateSnapshot = await getDocs(duplicateQuery)

  if (!duplicateSnapshot.empty) {
    throw new Error('A pending request already exists for this listing')
  }

  const docRef = await addDoc(requestsCollection, {
    listingId,
    listingTitle: listingTitle || '',
    fromUid,
    fromName: fromName || '',
    toUid,
    toName: toName || '',
    message,
    status: 'pending',
    createdAt: serverTimestamp(),
  })

  return docRef.id
}

export async function getRequestsReceived(uid) {
  const q = query(requestsCollection, where('toUid', '==', uid))
  const snap = await getDocs(q)

  const requests = snap.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }))

  const sorted = sortByNewest(requests)
  return hydrateRequestNames(sorted)
}

export async function getRequestsSent(uid) {
  const q = query(requestsCollection, where('fromUid', '==', uid))
  const snap = await getDocs(q)

  const requests = snap.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }))

  const sorted = sortByNewest(requests)
  return hydrateRequestNames(sorted)
}

export async function updateRequestStatus(requestId, status) {
  await updateDoc(doc(db, 'requests', requestId), {
    status,
  })
}
