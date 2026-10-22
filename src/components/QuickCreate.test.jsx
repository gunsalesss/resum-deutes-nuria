import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import QuickCreate from './QuickCreate'

describe('QuickCreate', () => {
  it('renders the three quick-create actions', () => {
    render(<QuickCreate onSelect={vi.fn()} />)
    expect(screen.getByText('Deute')).toBeInTheDocument()
    expect(screen.getByText('Compra')).toBeInTheDocument()
    expect(screen.getByText('Romanent')).toBeInTheDocument()
  })

  it('calls onSelect with the matching tab key', () => {
    const onSelect = vi.fn()
    render(<QuickCreate onSelect={onSelect} />)
    fireEvent.click(screen.getByText('Compra'))
    expect(onSelect).toHaveBeenCalledWith('compres')
  })
})
