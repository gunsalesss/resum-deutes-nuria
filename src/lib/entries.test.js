import { beforeEach, describe, expect, it, vi } from 'vitest'

const firestoreMocks = vi.hoisted(() => ({
  collection: vi.fn((db, name) => ({ __collection: name })),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn((db, collectionName, id) => ({ __doc: id, collectionName })),
  onSnapshot: vi.fn(),
  orderBy: vi.fn((field, dir) => ({ field, dir })),
  query: vi.fn((...args) => ({ __query: args })),
  serverTimestamp: vi.fn(() => 'SERVER_TIMESTAMP'),
}))

vi.mock('firebase/firestore', () => firestoreMocks)
vi.mock('../firebase', () => ({ db: {} }))

const notifyMock = vi.fn()
vi.mock('./toast', () => ({ notify: notifyMock }))

const {
  addEntry,
  setSaldada,
  updateEntry,
  removeEntry,
  subscribeToEntries,
} = await import('./entries')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('addEntry', () => {
  it('writes the entry with saldada defaulted to false and a server timestamp', async () => {
    firestoreMocks.addDoc.mockResolvedValueOnce({ id: 'new-id' })

    await addEntry({ type: 'compra', label: 'Colònia', amount: 37 })

    expect(firestoreMocks.addDoc).toHaveBeenCalledWith(
      { __collection: 'entries' },
      expect.objectContaining({
        type: 'compra',
        label: 'Colònia',
        amount: 37,
        saldada: false,
        createdAt: 'SERVER_TIMESTAMP',
      })
    )
    expect(notifyMock).toHaveBeenCalledWith('Afegit correctament', 'success')
  })

  it('respects an explicit saldada value', async () => {
    firestoreMocks.addDoc.mockResolvedValueOnce({ id: 'x' })

    await addEntry({ type: 'compra', label: 'X', amount: 1, saldada: true })

    expect(firestoreMocks.addDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ saldada: true })
    )
  })

  it('notifies an error and rethrows when the write fails', async () => {
    firestoreMocks.addDoc.mockRejectedValueOnce(new Error('boom'))

    await expect(addEntry({ type: 'compra' })).rejects.toThrow('boom')
    expect(notifyMock).toHaveBeenCalledWith(
      'Hi ha hagut un error desant els canvis.',
      'error'
    )
  })
})

describe('setSaldada', () => {
  it('updates only the saldada field and notifies accordingly', async () => {
    firestoreMocks.updateDoc.mockResolvedValueOnce()

    await setSaldada('abc', true)

    expect(firestoreMocks.doc).toHaveBeenCalledWith({}, 'entries', 'abc')
    expect(firestoreMocks.updateDoc).toHaveBeenCalledWith(
      { __doc: 'abc', collectionName: 'entries' },
      { saldada: true }
    )
    expect(notifyMock).toHaveBeenCalledWith('Marcat com a saldat', 'success')
  })

  it('shows a different message when un-marking as saldada', async () => {
    firestoreMocks.updateDoc.mockResolvedValueOnce()

    await setSaldada('abc', false)

    expect(notifyMock).toHaveBeenCalledWith('Marcat com a pendent', 'success')
  })
})

describe('updateEntry', () => {
  it('merges the given fields and notifies success', async () => {
    firestoreMocks.updateDoc.mockResolvedValueOnce()

    await updateEntry('id1', { amount: 30, label: 'Nou' })

    expect(firestoreMocks.updateDoc).toHaveBeenCalledWith(
      { __doc: 'id1', collectionName: 'entries' },
      { amount: 30, label: 'Nou' }
    )
    expect(notifyMock).toHaveBeenCalledWith('Canvis desats', 'success')
  })
})

describe('removeEntry', () => {
  it('deletes the document and notifies success', async () => {
    firestoreMocks.deleteDoc.mockResolvedValueOnce()

    await removeEntry('id1')

    expect(firestoreMocks.deleteDoc).toHaveBeenCalledWith({
      __doc: 'id1',
      collectionName: 'entries',
    })
    expect(notifyMock).toHaveBeenCalledWith('Eliminat', 'success')
  })

  it('notifies an error and rethrows when the delete fails', async () => {
    firestoreMocks.deleteDoc.mockRejectedValueOnce(new Error('nope'))

    await expect(removeEntry('id1')).rejects.toThrow('nope')
    expect(notifyMock).toHaveBeenCalledWith(
      'Hi ha hagut un error desant els canvis.',
      'error'
    )
  })
})

describe('subscribeToEntries', () => {
  it('queries ordered by createdAt asc and maps snapshot docs with their id', () => {
    const onChange = vi.fn()
    const onError = vi.fn()
    let capturedCallback
    firestoreMocks.onSnapshot.mockImplementation((q, cb) => {
      capturedCallback = cb
      return () => 'unsubscribed'
    })

    const unsubscribe = subscribeToEntries(onChange, onError)

    expect(firestoreMocks.orderBy).toHaveBeenCalledWith('createdAt', 'asc')
    expect(firestoreMocks.query).toHaveBeenCalled()

    capturedCallback({
      docs: [
        { id: 'a', data: () => ({ amount: 1 }) },
        { id: 'b', data: () => ({ amount: 2 }) },
      ],
    })

    expect(onChange).toHaveBeenCalledWith([
      { id: 'a', amount: 1 },
      { id: 'b', amount: 2 },
    ])
    expect(unsubscribe()).toBe('unsubscribed')
  })
})
