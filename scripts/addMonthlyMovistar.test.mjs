import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('dotenv/config', () => ({}))

const { addDoc, getDocs, where, collection, query, serverTimestamp } = vi.hoisted(() => ({
  addDoc: vi.fn(),
  getDocs: vi.fn(),
  where: vi.fn((field, op, value) => ({ field, op, value })),
  collection: vi.fn(() => ({ __collection: 'entries' })),
  query: vi.fn((...args) => ({ __query: args })),
  serverTimestamp: vi.fn(() => 'SERVER_TIMESTAMP'),
}))

vi.mock('firebase/app', () => ({ initializeApp: vi.fn(() => ({})) }))
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
}))

class ProcessExitSignal extends Error {}

const originalArgv = process.argv

// L'script real crida process.exit(0), que talla l'execució de debò. Aquí el
// simulem llançant una excepció especial just després de registrar la
// crida, perquè el codi posterior del mòdul no s'arribi a executar.
async function runScript() {
  try {
    await import('./addMonthlyMovistar.mjs')
  } catch (err) {
    if (!(err instanceof ProcessExitSignal)) throw err
  }
}

beforeEach(() => {
  vi.resetModules()
  vi.clearAllMocks()
  vi.spyOn(process, 'exit').mockImplementation(() => {
    throw new ProcessExitSignal()
  })
  vi.spyOn(console, 'log').mockImplementation(() => {})
})

afterEach(() => {
  process.argv = originalArgv
})

describe('addMonthlyMovistar script', () => {
  it('skips adding when an entry for that month already exists', async () => {
    process.argv = ['node', 'addMonthlyMovistar.mjs', '--year', '2025', '--month', '8']
    getDocs.mockResolvedValueOnce({ empty: false })

    await runScript()

    expect(where).toHaveBeenCalledWith('year', '==', 2025)
    expect(where).toHaveBeenCalledWith('month', '==', 8)
    expect(addDoc).not.toHaveBeenCalled()
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Ja existeix Movistar 8/2025')
    )
    expect(process.exit).toHaveBeenCalledWith(0)
  })

  it('adds a 24€ Movistar entry for the given month when none exists', async () => {
    process.argv = ['node', 'addMonthlyMovistar.mjs', '--year', '2025', '--month', '9']
    getDocs.mockResolvedValueOnce({ empty: true })

    await runScript()

    expect(addDoc).toHaveBeenCalledWith(
      { __collection: 'entries' },
      expect.objectContaining({
        type: 'mensualitat',
        label: 'Movistar',
        amount: 24,
        year: 2025,
        month: 9,
        saldada: false,
        createdAt: 'SERVER_TIMESTAMP',
      })
    )
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Afegit Movistar 9/2025'))
  })

  it('defaults to the current year/month when no flags are given', async () => {
    process.argv = ['node', 'addMonthlyMovistar.mjs']
    getDocs.mockResolvedValueOnce({ empty: true })

    const now = new Date()
    await runScript()

    expect(addDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        year: now.getFullYear(),
        month: now.getMonth() + 1,
      })
    )
  })
})
