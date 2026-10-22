import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import CompraForm from './CompraForm'

const { addEntry } = vi.hoisted(() => ({ addEntry: vi.fn() }))
vi.mock('../lib/entries', () => ({ addEntry }))

const { fetchLinkPreview } = vi.hoisted(() => ({ fetchLinkPreview: vi.fn() }))
vi.mock('../lib/linkPreview', () => ({ fetchLinkPreview }))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('CompraForm', () => {
  it('adds a compra with the entered label and amount', async () => {
    addEntry.mockResolvedValueOnce()
    render(<CompraForm />)

    fireEvent.change(screen.getByPlaceholderText("Nom de l'article"), {
      target: { value: 'Sabates' },
    })
    fireEvent.change(screen.getByPlaceholderText('Preu €'), { target: { value: '45' } })
    fireEvent.click(screen.getByText('Afegir compra'))

    await waitFor(() =>
      expect(addEntry).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'compra', label: 'Sabates', amount: 45 })
      )
    )
  })

  it('does not submit without a label or amount', () => {
    render(<CompraForm />)
    fireEvent.click(screen.getByText('Afegir compra'))
    expect(addEntry).not.toHaveBeenCalled()
  })

  it('fetches link metadata and pre-fills label/image before submitting', async () => {
    fetchLinkPreview.mockResolvedValueOnce({ title: 'Colònia', image: 'https://img/1.jpg' })
    addEntry.mockResolvedValueOnce()
    render(<CompraForm />)

    fireEvent.change(screen.getByPlaceholderText("Link d'Amazon (opcional)"), {
      target: { value: 'https://amazon.es/dp/X' },
    })
    fireEvent.click(screen.getByText('Obtenir dades'))

    await waitFor(() => expect(screen.getByDisplayValue('Colònia')).toBeInTheDocument())

    fireEvent.change(screen.getByPlaceholderText('Preu €'), { target: { value: '37' } })
    fireEvent.click(screen.getByText('Afegir compra'))

    await waitFor(() =>
      expect(addEntry).toHaveBeenCalledWith(
        expect.objectContaining({
          label: 'Colònia',
          image: 'https://img/1.jpg',
          link: 'https://amazon.es/dp/X',
          amount: 37,
        })
      )
    )
  })

  it('clears the form after a successful submit', async () => {
    addEntry.mockResolvedValueOnce()
    render(<CompraForm />)

    const labelInput = screen.getByPlaceholderText("Nom de l'article")
    fireEvent.change(labelInput, { target: { value: 'Sabates' } })
    fireEvent.change(screen.getByPlaceholderText('Preu €'), { target: { value: '45' } })
    fireEvent.click(screen.getByText('Afegir compra'))

    await waitFor(() => expect(labelInput).toHaveValue(''))
  })
})
