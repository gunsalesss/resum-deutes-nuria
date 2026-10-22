// Afegeix la mensualitat de Movistar (24€) del mes indicat (o del mes actual
// si no se'n passa cap), evitant duplicats si ja existeix.
//   node scripts/addMonthlyMovistar.mjs [--year 2025 --month 8]
import 'dotenv/config'
import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
}

function argValue(name) {
  const i = process.argv.indexOf(`--${name}`)
  return i !== -1 ? Number(process.argv[i + 1]) : undefined
}

const now = new Date()
const year = argValue('year') ?? now.getFullYear()
const month = argValue('month') ?? now.getMonth() + 1
const AMOUNT = 24
const LABEL = 'Movistar'

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const existing = await getDocs(
  query(
    collection(db, 'entries'),
    where('type', '==', 'mensualitat'),
    where('label', '==', LABEL),
    where('year', '==', year),
    where('month', '==', month)
  )
)

if (!existing.empty) {
  console.log(`Ja existeix ${LABEL} ${month}/${year}, no es duplica.`)
  process.exit(0)
}

await addDoc(collection(db, 'entries'), {
  type: 'mensualitat',
  label: LABEL,
  amount: AMOUNT,
  year,
  month,
  link: null,
  image: null,
  note: null,
  saldada: false,
  createdAt: serverTimestamp(),
})

console.log(`Afegit ${LABEL} ${month}/${year} (${AMOUNT}€).`)
process.exit(0)
