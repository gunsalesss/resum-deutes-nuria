import { useEffect, useMemo, useState } from 'react'
import './App.css'
import Summary from './components/Summary'
import QuickCreate from './components/QuickCreate'
import BottomNav from './components/BottomNav'
import ThemeToggle from './components/ThemeToggle'
import MensualitatForm from './components/MensualitatForm'
import CompraForm from './components/CompraForm'
import RomanentForm from './components/RomanentForm'
import EntryList from './components/EntryList'
import ToastHost from './components/ToastHost'
import { subscribeToEntries } from './lib/entries'
import { TIPUS } from './lib/constants'

const TITLES = {
  resum: 'Resum',
  mensualitats: 'Mensualitats',
  compres: 'Compres',
  romanents: 'Romanents',
}

function sumPending(entries) {
  return entries.reduce((acc, e) => acc + (e.saldada ? 0 : Number(e.amount) || 0), 0)
}

export default function App() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('resum')

  useEffect(() => {
    const unsub = subscribeToEntries(
      (data) => {
        setEntries(data)
        setLoading(false)
      },
      (err) => {
        console.error(err)
        setError('No s\'ha pogut connectar amb Firebase. Revisa la configuració (.env).')
        setLoading(false)
      }
    )
    return unsub
  }, [])

  const mensualitats = useMemo(() => entries.filter((e) => e.type === TIPUS.MENSUALITAT), [entries])
  const romanents = useMemo(() => entries.filter((e) => e.type === TIPUS.ROMANENT), [entries])
  const compres = useMemo(() => entries.filter((e) => e.type === TIPUS.COMPRA), [entries])

  const totalDeute = sumPending(mensualitats) + sumPending(romanents)
  const totalCompres = sumPending(compres)
  const saldoPendent = totalDeute - totalCompres

  return (
    <div className="app">
      <ToastHost />
      <header className="app-header">
        <h1>{TITLES[tab]}</h1>
        <ThemeToggle />
      </header>

      {error && <p className="form-error global-error">{error}</p>}

      {tab === 'resum' && (
        <Summary totalDeute={totalDeute} totalCompres={totalCompres} saldoPendent={saldoPendent} />
      )}

      {loading ? (
        <p className="empty-text">Carregant…</p>
      ) : (
        <main className="tab-content">
          {tab === 'resum' && (
            <>
              <QuickCreate onSelect={setTab} />
              <section>
                <h2>Últimes mensualitats</h2>
                <EntryList entries={mensualitats.slice(-5).reverse()} />
              </section>
              <section>
                <h2>Últimes compres</h2>
                <EntryList entries={compres.slice(-5).reverse()} />
              </section>
            </>
          )}

          {tab === 'mensualitats' && (
            <section>
              <MensualitatForm mensualitats={mensualitats} />
              <EntryList entries={mensualitats} groupByYear />
            </section>
          )}

          {tab === 'compres' && (
            <section>
              <CompraForm />
              <EntryList entries={[...compres].reverse()} />
            </section>
          )}

          {tab === 'romanents' && (
            <section>
              <RomanentForm />
              <EntryList entries={[...romanents].reverse()} />
            </section>
          )}
        </main>
      )}

      <BottomNav tab={tab} onChange={setTab} />
    </div>
  )
}
