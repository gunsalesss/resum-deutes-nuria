import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import EntryEditForm from './EntryEditForm'

const { updateEntry } = vi.hoisted(() => ({ updateEntry: vi.fn() }))
vi.mock('../lib/entries', () => ({ updateEntry }))

const { fetchLinkPreview } = vi.hoisted(() => ({ fetchLinkPreview: vi.fn() }))
vi.mock('../lib/linkPreview', () => ({ fetchLinkPreview }))

const mensualitat = {
  id: '1',
  type: 'mensualitat',
  label: 'Movistar',
  amount: 24,
  year: 2026,
  month: 10,
}

const compra = {
  id: '2',
  type: 'compra',
  label: 'Colònia',
  amount: 37,
  link: null,
  image: null,
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('EntryEditForm', () => {
  it('pre-fills the fields from the entry, including month/year for a mensualitat', () => {
    render(<EntryEditForm entry={mensualitat} onDone={vi.fn()} />)
    expect(screen.getByDisplayValue('Movistar')).toBeInTheDocument()
    expect(screen.getByDisplayValue('24')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2026')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Octubre')).toBeInTheDocument()
  })

  it('does not show month/year inputs for a compra', () => {
    render(<EntryEditForm entry={compra} onDone={vi.fn()} />)
    expect(screen.queryByDisplayValue('2026')).not.toBeInTheDocument()
  })

  it('saves the edited fields and calls onDone', async () => {
    updateEntry.mockResolvedValueOnce()
    const onDone = vi.fn()
    render(<EntryEditForm entry={mensualitat} onDone={onDone} />)

    fireEvent.change(screen.getByDisplayValue('24'), { target: { value: '30' } })
    fireEvent.click(screen.getByText('Desar'))

    await waitFor(() => expect(updateEntry).toHaveBeenCalledWith('1', {
      label: 'Movistar',
      amount: 30,
      link: null,
      image: null,
      year: 2026,
      month: 10,
    }))
    expect(onDone).toHaveBeenCalled()
  })

  it('cancels without saving', () => {
    const onDone = vi.fn()
    render(<EntryEditForm entry={mensualitat} onDone={onDone} />)
    fireEvent.click(screen.getByText('Cancel·lar'))
    expect(updateEntry).not.toHaveBeenCalled()
    expect(onDone).toHaveBeenCalled()
  })

  it('fetches a link preview and fills the label/image', async () => {
    fetchLinkPreview.mockResolvedValueOnce({
      title: 'Producte trobat',
      image: 'https://img/x.jpg',
    })
    render(<EntryEditForm entry={compra} onDone={vi.fn()} />)

    fireEvent.change(screen.getByPlaceholderText("Link d'Amazon (opcional)"), {
      target: { value: 'https://amazon.es/dp/X' },
    })
    fireEvent.click(screen.getByText('Obtenir dades'))

    await waitFor(() => expect(screen.getByDisplayValue('Producte trobat')).toBeInTheDocument())
    expect(fetchLinkPreview).toHaveBeenCalledWith('https://amazon.es/dp/X')
  })

  it('shows an error message when the link preview fails', async () => {
    fetchLinkPreview.mockRejectedValueOnce(new Error('network'))
    render(<EntryEditForm entry={compra} onDone={vi.fn()} />)

    fireEvent.change(screen.getByPlaceholderText("Link d'Amazon (opcional)"), {
      target: { value: 'https://amazon.es/dp/X' },
    })
    fireEvent.click(screen.getByText('Obtenir dades'))

    await waitFor(() =>
      expect(screen.getByText("No s'ha pogut obtenir informació del link.")).toBeInTheDocument()
    )
  })
})
