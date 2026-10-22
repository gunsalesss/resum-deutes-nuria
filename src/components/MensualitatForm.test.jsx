import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import MensualitatForm from './MensualitatForm'

const { addEntry } = vi.hoisted(() => ({ addEntry: vi.fn() }))
vi.mock('../lib/entries', () => ({ addEntry }))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('MensualitatForm', () => {
  it('defaults the concept to Movistar and the amount to 24', () => {
    render(<MensualitatForm mensualitats={[]} />)
    expect(screen.getByDisplayValue('Movistar')).toBeInTheDocument()
    expect(screen.getByDisplayValue('24')).toBeInTheDocument()
  })

  it('submits the selected month/year/amount as a mensualitat', async () => {
    addEntry.mockResolvedValueOnce()
    render(<MensualitatForm mensualitats={[]} />)

    fireEvent.click(screen.getByText('Afegir'))

    await waitFor(() =>
      expect(addEntry).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'mensualitat', label: 'Movistar', amount: 24 })
      )
    )
  })

  it('falls back to Movistar when the label is cleared', async () => {
    addEntry.mockResolvedValueOnce()
    render(<MensualitatForm mensualitats={[]} />)

    fireEvent.change(screen.getByPlaceholderText('Concepte'), { target: { value: '' } })
    fireEvent.click(screen.getByText('Afegir'))

    await waitFor(() =>
      expect(addEntry).toHaveBeenCalledWith(expect.objectContaining({ label: 'Movistar' }))
    )
  })
})
