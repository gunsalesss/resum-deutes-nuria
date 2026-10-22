import { useEffect, useMemo, useState } from 'react'
import './App.css'
import Summary from './components/Summary'
import QuickCreate from './components/QuickCreate'
import BottomNav from './components/BottomNav'
import ThemeToggle from './components/ThemeToggle'
import AddButton from './components/AddButton'
import Modal from './components/Modal'
import MensualitatForm from './components/MensualitatForm'
import CompraForm from './components/CompraForm'
import RomanentForm from './components/RomanentForm'
import EntryList from './components/EntryList'
import ToastHost from './components/ToastHost'
import { subscribeToEntries } from './lib/entries'
import { TIPUS } from './lib/constants'

const TITLES = {
  resum: 'Resum',
  mensualitats: 'Deutes',
  compres: 'Compres',
  romanents: 'Romanents',
}

const ADD_MODALS = {
  mensualitats: { title: 'Nou deute', Form: MensualitatForm },
  compres: { title: 'Nova compra', Form: CompraForm },
  romanents: { title: 'Nou romanent', Form: RomanentForm },
}

function sumPending(entries) {
  return entries.reduce((acc, e) => acc + (e.saldada ? 0 : Number(e.amount) || 0), 0)
}

export default function App() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('resum')
  const [addModalType, setAddModalType] = useState(null)

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

  const activeModal = addModalType ? ADD_MODALS[addModalType] : null
  const ActiveForm = activeModal?.Form

  return (
    <div className="app">
      <ToastHost />
      <header className="app-header">
        <h1>{TITLES[tab]}</h1>
        <ThemeToggle />
      </header>

      {error && <p className="form-error global-error">{error}</p>}

      {tab === 'resum' && (
        <Summary
          totalDeute={totalDeute}
          totalCompres={totalCompres}
          saldoPendent={saldoPendent}
          onSelectTab={setTab}
        />
      )}

      {loading ? (
        <p className="empty-text">Carregant…</p>
      ) : (
        <main className="tab-content">
          {tab === 'resum' && (
            <>
              <QuickCreate onSelect={setAddModalType} />
              <section>
                <h2>Últims deutes</h2>
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
              <AddButton label="Afegir deute" onClick={() => setAddModalType('mensualitats')} />
              <EntryList entries={mensualitats} groupByYear />
            </section>
          )}

          {tab === 'compres' && (
            <section>
              <AddButton label="Afegir compra" onClick={() => setAddModalType('compres')} />
              <EntryList entries={[...compres].reverse()} />
            </section>
          )}

          {tab === 'romanents' && (
            <section>
              <AddButton label="Afegir romanent" onClick={() => setAddModalType('romanents')} />
              <EntryList entries={[...romanents].reverse()} />
            </section>
          )}
        </main>
      )}

      <BottomNav tab={tab} onChange={setTab} />

      {activeModal && (
        <Modal title={activeModal.title} onClose={() => setAddModalType(null)}>
          <ActiveForm onDone={() => setAddModalType(null)} />
        </Modal>
      )}
    </div>
  )
}
