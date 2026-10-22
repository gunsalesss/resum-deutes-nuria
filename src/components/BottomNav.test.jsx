import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import BottomNav from './BottomNav'

describe('BottomNav', () => {
  it('renders all four tabs', () => {
    render(<BottomNav tab="resum" onChange={vi.fn()} />)
    ;['Resum', 'Deutes', 'Compres', 'Romanents'].forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument()
    })
  })

  it('marks the current tab as active', () => {
    render(<BottomNav tab="compres" onChange={vi.fn()} />)
    expect(screen.getByText('Compres').closest('button')).toHaveClass('active')
    expect(screen.getByText('Resum').closest('button')).not.toHaveClass('active')
  })

  it('calls onChange with the clicked tab key', () => {
    const onChange = vi.fn()
    render(<BottomNav tab="resum" onChange={onChange} />)
    fireEvent.click(screen.getByText('Romanents'))
    expect(onChange).toHaveBeenCalledWith('romanents')
  })
})
