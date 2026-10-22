import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Modal from './Modal'

describe('Modal', () => {
  it('renders the title and children', () => {
    render(
      <Modal title="Nova compra" onClose={vi.fn()}>
        <p>Contingut</p>
      </Modal>
    )
    expect(screen.getByText('Nova compra')).toBeInTheDocument()
    expect(screen.getByText('Contingut')).toBeInTheDocument()
  })

  it('calls onClose when clicking the backdrop', () => {
    const onClose = vi.fn()
    const { container } = render(
      <Modal title="X" onClose={onClose}>
        <p>Contingut</p>
      </Modal>
    )
    fireEvent.click(container.querySelector('.modal-overlay'))
    expect(onClose).toHaveBeenCalled()
  })

  it('does not call onClose when clicking inside the sheet', () => {
    const onClose = vi.fn()
    render(
      <Modal title="X" onClose={onClose}>
        <p>Contingut</p>
      </Modal>
    )
    fireEvent.click(screen.getByText('Contingut'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('calls onClose via the close button', () => {
    const onClose = vi.fn()
    render(
      <Modal title="X" onClose={onClose}>
        <p>Contingut</p>
      </Modal>
    )
    fireEvent.click(screen.getByLabelText('Tancar'))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose on Escape', () => {
    const onClose = vi.fn()
    render(
      <Modal title="X" onClose={onClose}>
        <p>Contingut</p>
      </Modal>
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })
})
