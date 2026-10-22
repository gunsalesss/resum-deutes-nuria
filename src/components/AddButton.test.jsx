import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import AddButton from './AddButton'

describe('AddButton', () => {
  it('renders the given label', () => {
    render(<AddButton label="Afegir mensualitat" onClick={vi.fn()} />)
    expect(screen.getByText('Afegir mensualitat')).toBeInTheDocument()
  })

  it('calls onClick when pressed', () => {
    const onClick = vi.fn()
    render(<AddButton label="Afegir" onClick={onClick} />)
    fireEvent.click(screen.getByText('Afegir'))
    expect(onClick).toHaveBeenCalled()
  })
})
