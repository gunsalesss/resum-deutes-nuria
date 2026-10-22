import { render, screen, act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ToastHost from './ToastHost'
import { notify } from '../lib/toast'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('ToastHost', () => {
  it('renders nothing when there are no toasts', () => {
    const { container } = render(<ToastHost />)
    expect(container).toBeEmptyDOMElement()
  })

  it('shows a toast when notify() is called, styled by its type', () => {
    render(<ToastHost />)
    act(() => {
      notify('Desat correctament', 'success')
    })
    const toast = screen.getByText('Desat correctament')
    expect(toast).toHaveClass('toast-success')
  })

  it('shows an error toast with the error style', () => {
    render(<ToastHost />)
    act(() => {
      notify('Error desant', 'error')
    })
    expect(screen.getByText('Error desant')).toHaveClass('toast-error')
  })

  it('auto-dismisses a toast after its timeout', () => {
    render(<ToastHost />)
    act(() => {
      notify('Missatge temporal')
    })
    expect(screen.getByText('Missatge temporal')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(2700)
    })

    expect(screen.queryByText('Missatge temporal')).not.toBeInTheDocument()
  })

  it('stacks multiple toasts', () => {
    render(<ToastHost />)
    act(() => {
      notify('Primer')
      notify('Segon')
    })
    expect(screen.getByText('Primer')).toBeInTheDocument()
    expect(screen.getByText('Segon')).toBeInTheDocument()
  })
})
