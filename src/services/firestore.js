import { getFirestore } from 'firebase/firestore/lite'
import { app } from './firebase'

export const db = getFirestore(app)
