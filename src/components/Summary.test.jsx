import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Summary from './Summary'

describe('Summary', () => {
  it('shows the pending debt and its breakdown', () => {
    render(
      <Summary totalDeute={300} totalCompres={220} saldoPendent={80} onSelectTab={vi.fn()} />
    )
    expect(screen.getByText('Deute pendent amb la Núria')).toBeInTheDocument()
    expect(screen.getByText('80,00 €')).toBeInTheDocument()
    expect(screen.getByText('300,00 €')).toBeInTheDocument()
    expect(screen.getByText('220,00 €')).toBeInTheDocument()
  })

  it('shows "Al nostre favor" with the absolute value when the balance is negative', () => {
    render(
      <Summary totalDeute={100} totalCompres={150} saldoPendent={-50} onSelectTab={vi.fn()} />
    )
    expect(screen.getByText('Al nostre favor')).toBeInTheDocument()
    expect(screen.getByText('50,00 €')).toBeInTheDocument()
  })

  it('navigates to mensualitats when clicking "Deutes acumulats"', () => {
    const onSelectTab = vi.fn()
    render(<Summary totalDeute={300} totalCompres={220} saldoPendent={80} onSelectTab={onSelectTab} />)
    fireEvent.click(screen.getByText('Deutes acumulats'))
    expect(onSelectTab).toHaveBeenCalledWith('mensualitats')
  })

  it('navigates to compres when clicking "Compres fetes"', () => {
    const onSelectTab = vi.fn()
    render(<Summary totalDeute={300} totalCompres={220} saldoPendent={80} onSelectTab={onSelectTab} />)
    fireEvent.click(screen.getByText('Compres fetes'))
    expect(onSelectTab).toHaveBeenCalledWith('compres')
  })
})
