import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import EntryList from './EntryList'

vi.mock('./EntryRow', () => ({
  default: ({ entry }) => <div data-testid="entry-row">{entry.label}</div>,
}))

describe('EntryList', () => {
  it('shows the empty text when there are no entries', () => {
    render(<EntryList entries={[]} />)
    expect(screen.getByText('Encara no hi ha res aquí.')).toBeInTheDocument()
  })

  it('shows a custom empty text', () => {
    render(<EntryList entries={[]} emptyText="Res per aquí" />)
    expect(screen.getByText('Res per aquí')).toBeInTheDocument()
  })

  it('renders a flat list when groupByYear is false', () => {
    render(
      <EntryList
        entries={[
          { id: '1', label: 'A', year: 2025, amount: 10 },
          { id: '2', label: 'B', year: 2026, amount: 20 },
        ]}
      />
    )
    expect(screen.getAllByTestId('entry-row')).toHaveLength(2)
    expect(screen.queryByText('2025')).not.toBeInTheDocument()
  })

  it('groups entries by year, most recent first, with a pending subtotal', () => {
    render(
      <EntryList
        groupByYear
        entries={[
          { id: '1', label: 'Gener', year: 2025, amount: 24, saldada: false },
          { id: '2', label: 'Febrer', year: 2025, amount: 24, saldada: true },
          { id: '3', label: 'Gener 26', year: 2026, amount: 30, saldada: false },
        ]}
      />
    )
    const years = screen.getAllByText(/^(2025|2026)$/).map((el) => el.textContent)
    expect(years).toEqual(['2026', '2025'])
    expect(screen.getByText('30,00 € pendent')).toBeInTheDocument()
    expect(screen.getByText('24,00 € pendent')).toBeInTheDocument()
  })
})
