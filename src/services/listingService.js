import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore/lite'
import { db } from './firestore'
import { getUserDisplayNameMap } from './userService'

const listingsCollection = collection(db, 'listings')

function getTimestampValue(value) {
  if (!value) return 0
  if (typeof value.toMillis === 'function') return value.toMillis()
  if (typeof value.seconds === 'number') return value.seconds * 1000
  return 0
}

function sortByNewest(listings) {
  return [...listings].sort(
    (a, b) => getTimestampValue(b.createdAt) - getTimestampValue(a.createdAt)
  )
}

async function hydrateListingOwnerNames(listings) {
  const nameMap = await getUserDisplayNameMap(listings.map((item) => item.ownerUid))

  return listings.map((item) => ({
    ...item,
    ownerName: nameMap[item.ownerUid] || item.ownerName || 'User',
  }))
}

export async function createListing(data, owner) {
  const payload = {
    ...data,
    ownerUid: owner.uid,
    ownerName: owner.displayName || owner.email,
    ownerNeighbourhood: owner.neighbourhood || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  const docRef = await addDoc(listingsCollection, payload)
  return docRef.id
}

export async function getAllListings() {
  const q = query(listingsCollection)
  const snap = await getDocs(q)

  const listings = snap.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }))

  const sorted = sortByNewest(listings)
  return hydrateListingOwnerNames(sorted)
}

export async function getListingsByOwner(ownerUid) {
  const q = query(listingsCollection, where('ownerUid', '==', ownerUid))
  const snap = await getDocs(q)

  const listings = snap.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }))

  const sorted = sortByNewest(listings)
  return hydrateListingOwnerNames(sorted)
}

export async function updateListing(listingId, data) {
  await updateDoc(doc(db, 'listings', listingId), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteListing(listingId) {
  await deleteDoc(doc(db, 'listings', listingId))
}
