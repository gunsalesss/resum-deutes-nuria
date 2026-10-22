import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import EntryRow from './EntryRow'

const { removeEntry, setSaldada } = vi.hoisted(() => ({
  removeEntry: vi.fn(),
  setSaldada: vi.fn(),
}))
vi.mock('../lib/entries', () => ({ removeEntry, setSaldada }))

vi.mock('./EntryEditForm', () => ({
  default: ({ entry, onDone }) => (
    <div data-testid="edit-form">
      Editant {entry.label}
      <button onClick={onDone}>Tancar edició</button>
    </div>
  ),
}))

const baseEntry = {
  id: '1',
  type: 'mensualitat',
  label: 'Movistar',
  amount: 24,
  year: 2026,
  month: 10,
  saldada: false,
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(window, 'confirm').mockReturnValue(true)
})

describe('EntryRow', () => {
  it('renders the label, amount and subtitle', () => {
    render(<EntryRow entry={baseEntry} />)
    expect(screen.getByText('Movistar')).toBeInTheDocument()
    expect(screen.getByText('24,00 €')).toBeInTheDocument()
    expect(screen.getByText('Octubre 2026')).toBeInTheDocument()
  })

  it('opens the edit form when clicking the card', () => {
    render(<EntryRow entry={baseEntry} />)
    fireEvent.click(screen.getByText('Movistar'))
    expect(screen.getByTestId('edit-form')).toBeInTheDocument()
  })

  it('closes the edit form via onDone', () => {
    render(<EntryRow entry={baseEntry} />)
    fireEvent.click(screen.getByText('Movistar'))
    fireEvent.click(screen.getByText('Tancar edició'))
    expect(screen.queryByTestId('edit-form')).not.toBeInTheDocument()
  })

  it('toggles saldada without opening the edit form', () => {
    render(<EntryRow entry={baseEntry} />)
    fireEvent.click(screen.getByRole('checkbox'))
    expect(setSaldada).toHaveBeenCalledWith('1', true)
    expect(screen.queryByTestId('edit-form')).not.toBeInTheDocument()
  })

  it('asks for confirmation and deletes without opening the edit form', async () => {
    removeEntry.mockResolvedValueOnce()
    render(<EntryRow entry={baseEntry} />)
    fireEvent.click(screen.getByTitle('Eliminar'))
    expect(window.confirm).toHaveBeenCalledWith('Segur que vols eliminar "Movistar"?')
    expect(removeEntry).toHaveBeenCalledWith('1')
    expect(screen.queryByTestId('edit-form')).not.toBeInTheDocument()
  })

  it('does not delete when the confirmation is cancelled', () => {
    window.confirm.mockReturnValueOnce(false)
    render(<EntryRow entry={baseEntry} />)
    fireEvent.click(screen.getByTitle('Eliminar'))
    expect(removeEntry).not.toHaveBeenCalled()
  })

  it('shows a dimmed state for saldada entries', () => {
    const { container } = render(<EntryRow entry={{ ...baseEntry, saldada: true }} />)
    expect(container.querySelector('.entry-row')).toHaveClass('saldada')
  })

  it('renders a link and thumbnail for entries with a link/image (compra)', () => {
    const compra = {
      ...baseEntry,
      type: 'compra',
      label: 'Colònia',
      link: 'https://amazon.es/dp/X',
      image: 'https://img/1.jpg',
      month: null,
      year: 2025,
    }
    render(<EntryRow entry={compra} />)
    const link = screen.getByRole('link', { name: 'Colònia' })
    expect(link).toHaveAttribute('href', 'https://amazon.es/dp/X')
    expect(document.querySelector('img')).toHaveAttribute('src', 'https://img/1.jpg')
  })
})
