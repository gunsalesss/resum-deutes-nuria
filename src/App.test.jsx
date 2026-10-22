import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Firestore en memòria: simula addDoc/updateDoc/deleteDoc/onSnapshot de debò,
// per poder provar App.jsx + els formularis + lib/entries.js treballant junts,
// sense dependre de xarxa ni d'un emulador.
function createFakeFirestore() {
  let docs = []
  let nextId = 1
  let listener = null

  function emit() {
    if (!listener) return
    listener({
      docs: docs.map((d) => ({ id: d.id, data: () => d.data })),
    })
  }

  return {
    emit,
    seed(initialDocs) {
      docs = initialDocs.map((data, i) => ({ id: `seed-${i}`, data }))
    },
    collection: vi.fn(() => ({ __collection: 'entries' })),
    doc: vi.fn((db, collectionName, id) => ({ __id: id })),
    query: vi.fn((c) => c),
    orderBy: vi.fn(),
    onSnapshot: vi.fn((q, cb) => {
      listener = cb
      emit()
      return () => {
        listener = null
      }
    }),
    addDoc: vi.fn(async (c, data) => {
      const id = `id-${nextId++}`
      docs.push({ id, data })
      emit()
      return { id }
    }),
    updateDoc: vi.fn(async (ref, data) => {
      const entry = docs.find((d) => d.id === ref.__id)
      if (entry) Object.assign(entry.data, data)
      emit()
    }),
    deleteDoc: vi.fn(async (ref) => {
      docs = docs.filter((d) => d.id !== ref.__id)
      emit()
    }),
    serverTimestamp: vi.fn(() => 'SERVER_TIMESTAMP'),
  }
}

const fakeDb = createFakeFirestore()

vi.mock('firebase/firestore', () => fakeDb)
vi.mock('./firebase', () => ({ db: {} }))
vi.mock('./lib/linkPreview', () => ({ fetchLinkPreview: vi.fn() }))

const { default: App } = await import('./App')

beforeEach(() => {
  vi.clearAllMocks()
  fakeDb.seed([])
})

afterEach(() => {
  fakeDb.seed([])
})

describe('App (integració)', () => {
  it('mostra el resum a 0 quan no hi ha cap entrada', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getAllByText('0,00 €')).toHaveLength(3))
  })

  it('calcula el deute pendent com mensualitats + romanents - compres', async () => {
    fakeDb.seed([
      { type: 'mensualitat', label: 'Movistar', amount: 24, year: 2026, month: 1, saldada: false },
      { type: 'romanent', label: 'Acumulat', amount: 60, year: 2025, saldada: false },
      { type: 'compra', label: 'Colònia', amount: 37, year: 2025, saldada: false },
    ])
    render(<App />)

    await waitFor(() => screen.getByText('Deute pendent amb la Núria'))
    const statGrid = document.querySelector('.stat-grid')
    expect(within(statGrid).getByText('47,00 €')).toBeInTheDocument()
    expect(within(statGrid).getByText('84,00 €')).toBeInTheDocument() // deutes acumulats
    expect(within(statGrid).getByText('37,00 €')).toBeInTheDocument() // compres fetes
  })

  it('ignora les entrades saldades en el total pendent', async () => {
    fakeDb.seed([
      { type: 'mensualitat', label: 'Movistar', amount: 24, year: 2026, month: 1, saldada: true },
      { type: 'mensualitat', label: 'Movistar', amount: 24, year: 2026, month: 2, saldada: false },
    ])
    render(<App />)
    await waitFor(() => screen.getByText('Deute pendent amb la Núria'))
    const mainCard = document.querySelector('.stat-card-main')
    expect(within(mainCard).getByText('24,00 €')).toBeInTheDocument()
  })

  it('navega a Deutes en clicar la targeta "Deutes acumulats"', async () => {
    render(<App />)
    await waitFor(() => screen.getByText('Deutes acumulats'))
    fireEvent.click(screen.getByText('Deutes acumulats'))
    expect(screen.getByRole('heading', { name: 'Deutes' })).toBeInTheDocument()
  })

  it('navega a Compres en clicar la targeta "Compres fetes"', async () => {
    render(<App />)
    await waitFor(() => screen.getByText('Compres fetes'))
    fireEvent.click(screen.getByText('Compres fetes'))
    expect(screen.getByRole('heading', { name: 'Compres' })).toBeInTheDocument()
  })

  it('afegeix un deute des del botó gran, en blanc per defecte, i tanca el modal en desar', async () => {
    render(<App />)
    await waitFor(() => screen.getByText('Deutes'))
    fireEvent.click(screen.getByText('Deutes'))

    fireEvent.click(screen.getByText('Afegir deute'))
    expect(screen.getByRole('dialog', { name: 'Nou deute' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Concepte (p.ex. Movistar)')).toHaveValue('')
    expect(screen.getByPlaceholderText('Import €')).toHaveValue(null)

    fireEvent.change(screen.getByPlaceholderText('Concepte (p.ex. Movistar)'), {
      target: { value: 'Movistar' },
    })
    fireEvent.change(screen.getByPlaceholderText('Import €'), { target: { value: '24' } })
    fireEvent.click(screen.getByText('Afegir'))

    await waitFor(() => expect(screen.getByText('Movistar')).toBeInTheDocument())
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('Resum'))
    await waitFor(() => {
      const mainCard = document.querySelector('.stat-card-main')
      expect(within(mainCard).getByText('24,00 €')).toBeInTheDocument()
    })
  })

  it('obre el modal d\'afegir directament des de les targetes ràpides del Resum', async () => {
    render(<App />)
    await waitFor(() => screen.getByText('Compra'))
    fireEvent.click(screen.getByText('Compra'))

    expect(screen.getByRole('dialog', { name: 'Nova compra' })).toBeInTheDocument()
    // la pestanya activa continua sent Resum, el modal es mostra per sobre
    expect(screen.getByRole('heading', { name: 'Resum' })).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Tancar'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('edita una entrada clicant la targeta i deixa l\'import actualitzat', async () => {
    fakeDb.seed([
      { type: 'mensualitat', label: 'Movistar', amount: 24, year: 2026, month: 1, saldada: false },
    ])
    render(<App />)
    await waitFor(() => screen.getByText('Deutes'))
    fireEvent.click(screen.getByText('Deutes'))

    await waitFor(() => screen.getByText('Movistar'))
    fireEvent.click(screen.getByText('Movistar'))

    const editForm = (await screen.findByText('Desar')).closest('.entry-row-editing')
    fireEvent.change(within(editForm).getByDisplayValue('24'), { target: { value: '30' } })
    fireEvent.click(within(editForm).getByText('Desar'))

    await waitFor(() => expect(screen.getByText('30,00 €')).toBeInTheDocument())
  })

  it('marca una entrada com a saldada i deixa de comptar al total', async () => {
    fakeDb.seed([
      { type: 'mensualitat', label: 'Movistar', amount: 24, year: 2026, month: 1, saldada: false },
    ])
    render(<App />)
    await waitFor(() => screen.getByText('Deutes'))
    fireEvent.click(screen.getByText('Deutes'))

    await waitFor(() => screen.getByText('Movistar'))
    fireEvent.click(screen.getByRole('checkbox'))

    fireEvent.click(screen.getByText('Resum'))
    await waitFor(() => {
      const values = screen.getAllByText('0,00 €')
      expect(values.length).toBeGreaterThan(0)
    })
  })

  it('elimina una entrada després de confirmar-ho', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    fakeDb.seed([
      { type: 'compra', label: 'Colònia', amount: 37, year: 2025, saldada: false },
    ])
    render(<App />)
    await waitFor(() => screen.getByText('Compres'))
    fireEvent.click(screen.getByText('Compres'))

    await waitFor(() => screen.getByText('Colònia'))
    fireEvent.click(screen.getByTitle('Eliminar'))

    await waitFor(() => expect(screen.queryByText('Colònia')).not.toBeInTheDocument())
  })

  it('afegeix un romanent i el mostra a la pestanya corresponent', async () => {
    render(<App />)
    await waitFor(() => screen.getByText('Romanents'))
    fireEvent.click(screen.getByText('Romanents'))
    fireEvent.click(screen.getByText('Afegir romanent'))

    fireEvent.change(screen.getByPlaceholderText('Descripció (p.ex. Acumulat 2025)'), {
      target: { value: 'Acumulat 2024' },
    })
    fireEvent.change(screen.getByPlaceholderText('Import €'), { target: { value: '60' } })
    fireEvent.click(screen.getByText('Afegir'))

    await waitFor(() => expect(screen.getByText('Acumulat 2024')).toBeInTheDocument())
  })
})
