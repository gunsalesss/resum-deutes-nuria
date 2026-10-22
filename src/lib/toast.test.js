import { describe, expect, it, vi } from 'vitest'
import { notify, onToast } from './toast'

describe('toast pub/sub', () => {
  it('delivers a notified message to a subscribed listener', () => {
    const listener = vi.fn()
    const unsubscribe = onToast(listener)

    notify('Desat correctament', 'success')

    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener.mock.calls[0][0]).toMatchObject({
      message: 'Desat correctament',
      type: 'success',
    })
    unsubscribe()
  })

  it('defaults the type to success', () => {
    const listener = vi.fn()
    const unsubscribe = onToast(listener)

    notify('Fet')

    expect(listener.mock.calls[0][0].type).toBe('success')
    unsubscribe()
  })

  it('assigns a unique, increasing id to each toast', () => {
    const listener = vi.fn()
    const unsubscribe = onToast(listener)

    notify('Un')
    notify('Dos')

    const [first, second] = listener.mock.calls.map((c) => c[0].id)
    expect(second).toBeGreaterThan(first)
    unsubscribe()
  })

  it('stops delivering messages after unsubscribe', () => {
    const listener = vi.fn()
    const unsubscribe = onToast(listener)
    unsubscribe()

    notify('No hauria d\'arribar')

    expect(listener).not.toHaveBeenCalled()
  })

  it('notifies multiple independent listeners', () => {
    const a = vi.fn()
    const b = vi.fn()
    const unsubA = onToast(a)
    const unsubB = onToast(b)

    notify('Hola')

    expect(a).toHaveBeenCalledTimes(1)
    expect(b).toHaveBeenCalledTimes(1)
    unsubA()
    unsubB()
  })
})
