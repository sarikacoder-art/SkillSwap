import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore/lite'
import { db } from './firestore'

export async function createUserProfile({
  uid,
  email,
  displayName,
  neighbourhood,
}) {
  await setDoc(doc(db, 'users', uid), {
    uid,
    displayName,
    email,
    neighbourhood,
    createdAt: serverTimestamp(),
  })
}

export async function getUserDisplayNameMap(uids) {
  const uniqueUids = Array.from(new Set((uids || []).filter(Boolean)))
  if (uniqueUids.length === 0) return {}

  const entries = await Promise.all(
    uniqueUids.map(async (uid) => {
      try {
        const snap = await getDoc(doc(db, 'users', uid))
        if (!snap.exists()) return [uid, '']
        const data = snap.data()
        return [uid, data?.displayName || '']
      } catch {
        return [uid, '']
      }
    })
  )

  return Object.fromEntries(entries)
}
