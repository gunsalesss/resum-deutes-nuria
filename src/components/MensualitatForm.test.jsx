import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import MensualitatForm from './MensualitatForm'

const { addEntry } = vi.hoisted(() => ({ addEntry: vi.fn() }))
vi.mock('../lib/entries', () => ({ addEntry }))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('MensualitatForm', () => {
  it('defaults the concept to Movistar, the amount to 24 and the date to today', () => {
    const now = new Date()
    render(<MensualitatForm />)
    expect(screen.getByDisplayValue('Movistar')).toBeInTheDocument()
    expect(screen.getByDisplayValue('24')).toBeInTheDocument()
    expect(screen.getByDisplayValue(String(now.getFullYear()))).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toHaveValue(String(now.getMonth() + 1))
  })

  it('submits the selected month/year/amount as a mensualitat', async () => {
    addEntry.mockResolvedValueOnce()
    render(<MensualitatForm />)

    fireEvent.click(screen.getByText('Afegir'))

    await waitFor(() =>
      expect(addEntry).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'mensualitat', label: 'Movistar', amount: 24 })
      )
    )
  })

  it('falls back to Movistar when the label is cleared', async () => {
    addEntry.mockResolvedValueOnce()
    render(<MensualitatForm />)

    fireEvent.change(screen.getByPlaceholderText('Concepte'), { target: { value: '' } })
    fireEvent.click(screen.getByText('Afegir'))

    await waitFor(() =>
      expect(addEntry).toHaveBeenCalledWith(expect.objectContaining({ label: 'Movistar' }))
    )
  })

  it('calls onDone after a successful submit', async () => {
    addEntry.mockResolvedValueOnce()
    const onDone = vi.fn()
    render(<MensualitatForm onDone={onDone} />)

    fireEvent.click(screen.getByText('Afegir'))

    await waitFor(() => expect(onDone).toHaveBeenCalled())
  })

  it('does not call onDone when the submit fails', async () => {
    addEntry.mockRejectedValueOnce(new Error('boom'))
    const onDone = vi.fn()
    render(<MensualitatForm onDone={onDone} />)

    fireEvent.click(screen.getByText('Afegir'))

    await waitFor(() => expect(addEntry).toHaveBeenCalled())
    expect(onDone).not.toHaveBeenCalled()
  })
})
