// Importa les dades inicials de la llista de WhatsApp a Firestore.
// Fer servir UN COP, després de configurar el .env amb les credencials de Firebase.
//   node scripts/seed.mjs
import 'dotenv/config'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const entries = [
  { type: 'romanent', label: 'Acumulat 2025', amount: 60, year: 2025 },
  { type: 'mensualitat', label: 'Movistar', amount: 24, year: 2025, month: 1 },
  { type: 'mensualitat', label: 'Movistar', amount: 24, year: 2025, month: 2 },
  { type: 'mensualitat', label: 'Movistar', amount: 24, year: 2025, month: 3 },
  { type: 'mensualitat', label: 'Movistar', amount: 24, year: 2025, month: 4 },
  { type: 'mensualitat', label: 'Movistar', amount: 24, year: 2025, month: 5 },
  { type: 'mensualitat', label: 'Movistar', amount: 24, year: 2025, month: 6 },
  { type: 'mensualitat', label: 'Movistar', amount: 24, year: 2025, month: 7 },
  { type: 'compra', label: 'Colònia', amount: 37, year: 2025 },
  { type: 'compra', label: 'Colors', amount: 40, year: 2025 },
  { type: 'compra', label: 'Paper', amount: 23, year: 2025 },
  { type: 'compra', label: 'Sandàlies', amount: 40, year: 2025 },
  { type: 'compra', label: 'Col·lagen', amount: 40, year: 2025 },
  { type: 'compra', label: 'Colònia', amount: 40, year: 2025 },
]

for (const entry of entries) {
  await addDoc(collection(db, 'entries'), {
    ...entry,
    link: entry.link ?? null,
    image: entry.image ?? null,
    note: entry.note ?? null,
    saldada: false,
    createdAt: serverTimestamp(),
  })
  console.log(`Afegit: ${entry.label} (${entry.amount}€)`)
}

console.log('Fet! Dades inicials importades.')
process.exit(0)
