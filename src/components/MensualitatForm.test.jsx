import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import MensualitatForm from './MensualitatForm'

const { addEntry } = vi.hoisted(() => ({ addEntry: vi.fn() }))
vi.mock('../lib/entries', () => ({ addEntry }))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('MensualitatForm', () => {
  it('starts with the concept and amount blank, and the date defaulted to today', () => {
    const now = new Date()
    render(<MensualitatForm />)
    expect(screen.getByPlaceholderText('Concepte (p.ex. Movistar)')).toHaveValue('')
    expect(screen.getByPlaceholderText('Import €')).toHaveValue(null)
    expect(screen.getByDisplayValue(String(now.getFullYear()))).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toHaveValue(String(now.getMonth() + 1))
  })

  it('does not submit without a concept or amount', () => {
    render(<MensualitatForm />)
    fireEvent.click(screen.getByText('Afegir'))
    expect(addEntry).not.toHaveBeenCalled()
  })

  it('submits the entered concept, amount and selected month/year', async () => {
    addEntry.mockResolvedValueOnce()
    render(<MensualitatForm />)

    fireEvent.change(screen.getByPlaceholderText('Concepte (p.ex. Movistar)'), {
      target: { value: 'Regal Irina' },
    })
    fireEvent.change(screen.getByPlaceholderText('Import €'), { target: { value: '10' } })
    fireEvent.click(screen.getByText('Afegir'))

    await waitFor(() =>
      expect(addEntry).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'mensualitat', label: 'Regal Irina', amount: 10 })
      )
    )
  })

  it('calls onDone after a successful submit', async () => {
    addEntry.mockResolvedValueOnce()
    const onDone = vi.fn()
    render(<MensualitatForm onDone={onDone} />)

    fireEvent.change(screen.getByPlaceholderText('Concepte (p.ex. Movistar)'), {
      target: { value: 'Movistar' },
    })
    fireEvent.change(screen.getByPlaceholderText('Import €'), { target: { value: '24' } })
    fireEvent.click(screen.getByText('Afegir'))

    await waitFor(() => expect(onDone).toHaveBeenCalled())
  })

  it('does not call onDone when the submit fails', async () => {
    addEntry.mockRejectedValueOnce(new Error('boom'))
    const onDone = vi.fn()
    render(<MensualitatForm onDone={onDone} />)

    fireEvent.change(screen.getByPlaceholderText('Concepte (p.ex. Movistar)'), {
      target: { value: 'Movistar' },
    })
    fireEvent.change(screen.getByPlaceholderText('Import €'), { target: { value: '24' } })
    fireEvent.click(screen.getByText('Afegir'))

    await waitFor(() => expect(addEntry).toHaveBeenCalled())
    expect(onDone).not.toHaveBeenCalled()
  })
})
