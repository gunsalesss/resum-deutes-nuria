import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import RomanentForm from './RomanentForm'

const { addEntry } = vi.hoisted(() => ({ addEntry: vi.fn() }))
vi.mock('../lib/entries', () => ({ addEntry }))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('RomanentForm', () => {
  it('adds a romanent with the entered description, year and amount', async () => {
    addEntry.mockResolvedValueOnce()
    render(<RomanentForm />)

    fireEvent.change(screen.getByPlaceholderText('Descripció (p.ex. Acumulat 2025)'), {
      target: { value: 'Acumulat 2024' },
    })
    fireEvent.change(screen.getByPlaceholderText('Import €'), { target: { value: '60' } })
    fireEvent.click(screen.getByText('Afegir'))

    await waitFor(() =>
      expect(addEntry).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'romanent', label: 'Acumulat 2024', amount: 60 })
      )
    )
  })

  it('clears label and amount after submitting', async () => {
    addEntry.mockResolvedValueOnce()
    render(<RomanentForm />)

    const labelInput = screen.getByPlaceholderText('Descripció (p.ex. Acumulat 2025)')
    fireEvent.change(labelInput, { target: { value: 'Acumulat 2024' } })
    fireEvent.change(screen.getByPlaceholderText('Import €'), { target: { value: '60' } })
    fireEvent.click(screen.getByText('Afegir'))

    await waitFor(() => expect(labelInput).toHaveValue(''))
  })
})
