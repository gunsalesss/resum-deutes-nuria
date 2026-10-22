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
import { notify } from './toast'

const COLLECTION = 'entries'

async function withFeedback(action, successMessage) {
  try {
    const result = await action()
    notify(successMessage, 'success')
    return result
  } catch (err) {
    console.error(err)
    notify('Hi ha hagut un error desant els canvis.', 'error')
    throw err
  }
}

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
  return withFeedback(
    () =>
      addDoc(collection(db, COLLECTION), {
        ...entry,
        saldada: entry.saldada ?? false,
        createdAt: serverTimestamp(),
      }),
    'Afegit correctament'
  )
}

export async function setSaldada(id, saldada) {
  return withFeedback(
    () => updateDoc(doc(db, COLLECTION, id), { saldada }),
    saldada ? 'Marcat com a saldat' : 'Marcat com a pendent'
  )
}

export async function updateEntry(id, data) {
  return withFeedback(() => updateDoc(doc(db, COLLECTION, id), data), 'Canvis desats')
}

export async function removeEntry(id) {
  return withFeedback(() => deleteDoc(doc(db, COLLECTION, id)), 'Eliminat')
}
