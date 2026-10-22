import { describe, expect, it } from 'vitest'
import { nextPendingMonth } from './nextPendingMonth'

const NOW = new Date(2026, 9, 22) // 22 octubre 2026
const WINDOW_START = { year: 2024, month: 10 } // exactament 24 mesos abans de NOW

function monthsFrom(start, count) {
  const list = []
  let d = new Date(start.year, start.month - 1, 1)
  for (let i = 0; i < count; i++) {
    list.push({ year: d.getFullYear(), month: d.getMonth() + 1 })
    d.setMonth(d.getMonth() + 1)
  }
  return list
}

describe('nextPendingMonth', () => {
  it('suggests the current month when nothing is set up yet (no bound to search from)', () => {
    // Amb zero entrades, la cerca (que comença 24 mesos enrere) troba de
    // seguida que el mes de fa 24 mesos "falta", així que és el que suggereix.
    expect(nextPendingMonth([], NOW)).toEqual(WINDOW_START)
  })

  it('suggests the oldest missing month, starting the search 24 months back', () => {
    const mensualitats = monthsFrom(WINDOW_START, 3) // omple els 3 primers mesos de la finestra
    expect(nextPendingMonth(mensualitats, NOW)).toEqual(monthsFrom(WINDOW_START, 4)[3])
  })

  it('skips months that already exist, even out of order', () => {
    const [m0, m1, m2] = monthsFrom(WINDOW_START, 3)
    const mensualitats = [m2, m0, m1] // mateixos 3 mesos, en un altre ordre
    expect(nextPendingMonth(mensualitats, NOW)).toEqual(monthsFrom(WINDOW_START, 4)[3])
  })

  it('falls back to the current month when the last 24 months are all filled', () => {
    const mensualitats = monthsFrom(WINDOW_START, 25) // fins al mes actual, inclòs
    expect(nextPendingMonth(mensualitats, NOW)).toEqual({ year: 2026, month: 10 })
  })
})
