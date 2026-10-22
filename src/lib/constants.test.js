import { describe, expect, it } from 'vitest'
import { formatEuros, MESOS, TIPUS, DEFAULT_MENSUALITAT } from './constants'

describe('formatEuros', () => {
  it('formats a positive number with two decimals and €', () => {
    expect(formatEuros(24)).toBe('24,00 €')
  })

  it('formats decimals correctly', () => {
    expect(formatEuros(23.5)).toBe('23,50 €')
  })

  it('treats null/undefined/NaN as 0', () => {
    expect(formatEuros(null)).toBe('0,00 €')
    expect(formatEuros(undefined)).toBe('0,00 €')
    expect(formatEuros('not-a-number')).toBe('0,00 €')
  })

  it('formats negative numbers', () => {
    expect(formatEuros(-8)).toBe('-8,00 €')
  })
})

describe('constants', () => {
  it('has 12 months in Catalan', () => {
    expect(MESOS).toHaveLength(12)
    expect(MESOS[0]).toBe('Gener')
    expect(MESOS[11]).toBe('Desembre')
  })

  it('exposes the three entry types', () => {
    expect(TIPUS).toEqual({
      MENSUALITAT: 'mensualitat',
      ROMANENT: 'romanent',
      COMPRA: 'compra',
    })
  })

  it('defaults the monthly entry to Movistar 24€', () => {
    expect(DEFAULT_MENSUALITAT).toEqual({ label: 'Movistar', amount: 24 })
  })
})
