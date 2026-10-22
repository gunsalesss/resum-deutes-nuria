import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

const COLLECTION = 'entries'

export function subscribeToEntries(onChange, onError) {
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'asc'))
  return onSnapshot(
    q,
    (snapshot) => {
      const entries = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      onChange(entries)
    },
    onError
  )
}

export async function addEntry(entry) {
  return addDoc(collection(db, COLLECTION), {
    ...entry,
    saldada: entry.saldada ?? false,
    createdAt: serverTimestamp(),
  })
}

export async function setSaldada(id, saldada) {
  return updateDoc(doc(db, COLLECTION, id), { saldada })
}

export async function updateEntry(id, data) {
  return updateDoc(doc(db, COLLECTION, id), data)
}

export async function removeEntry(id) {
  return deleteDoc(doc(db, COLLECTION, id))
}
