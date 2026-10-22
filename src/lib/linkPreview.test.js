import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchLinkPreview } from './linkPreview'

function mockFetchOnce(body, ok = true) {
  return vi.fn().mockResolvedValueOnce({
    ok,
    json: () => Promise.resolve(body),
  })
}

function okJson(body) {
  return { ok: true, json: () => Promise.resolve(body) }
}

// Avança els setTimeout dels reintents sense esperar de debò.
async function flushRetries(promise, times = 2) {
  for (let i = 0; i < times; i++) {
    await vi.advanceTimersByTimeAsync(1000)
  }
  return promise
}

describe('fetchLinkPreview', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('calls the microlink.io API (not .com) with the encoded url', async () => {
    const fetchMock = mockFetchOnce({
      status: 'success',
      data: { title: 'Un producte', image: { url: 'https://img/1.jpg' }, description: 'desc' },
    })
    vi.stubGlobal('fetch', fetchMock)

    await fetchLinkPreview('https://www.amazon.es/dp/ABC123')

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const calledUrl = fetchMock.mock.calls[0][0]
    expect(calledUrl).toContain('https://api.microlink.io/')
    expect(calledUrl).toContain(encodeURIComponent('https://www.amazon.es/dp/ABC123'))
  })

  it('returns title, image and description on success, without retrying', async () => {
    const fetchMock = mockFetchOnce({
      status: 'success',
      data: { title: 'Un producte', image: { url: 'https://img/1.jpg' }, description: 'desc' },
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await fetchLinkPreview('https://www.amazon.es/dp/ABC123')

    expect(result).toEqual({
      title: 'Un producte',
      image: 'https://img/1.jpg',
      description: 'desc',
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('retries with the resolved, query-stripped url when a short link returns no data', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        okJson({ status: 'success', data: { url: 'https://www.amazon.es/dp/ABC123?ref=tracking123' } })
      )
      .mockResolvedValueOnce(
        okJson({
          status: 'success',
          data: { title: 'Trobat al segon intent', image: { url: 'https://img/2.jpg' } },
        })
      )
    vi.stubGlobal('fetch', fetchMock)

    const result = await flushRetries(fetchLinkPreview('https://amzn.eu/d/short'), 1)

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock.mock.calls[1][0]).toContain(
      encodeURIComponent('https://www.amazon.es/dp/ABC123')
    )
    expect(result.title).toBe('Trobat al segon intent')
  })

  it('retries up to 3 times in total before giving up', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(okJson({ status: 'success', data: {} }))
      .mockResolvedValueOnce(okJson({ status: 'success', data: {} }))
      .mockResolvedValueOnce(okJson({ status: 'success', data: {} }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await flushRetries(fetchLinkPreview('https://example.com'), 2)

    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(result).toEqual({ title: '', image: '', description: '' })
  })

  it('succeeds on a later retry after Amazon blocks the first attempts (link.yu flaky scraping)', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(okJson({ status: 'success', data: {} }))
      .mockResolvedValueOnce(okJson({ status: 'success', data: {} }))
      .mockResolvedValueOnce(
        okJson({ status: 'success', data: { title: 'Trobat al 3r intent', image: { url: 'https://img/3.jpg' } } })
      )
    vi.stubGlobal('fetch', fetchMock)

    const result = await flushRetries(fetchLinkPreview('https://www.amazon.es/dp/ABC123'), 2)

    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(result.title).toBe('Trobat al 3r intent')
  })

  it('keeps retrying even if an intermediate attempt throws', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(okJson({ status: 'success', data: {} }))
      .mockRejectedValueOnce(new Error('network blip'))
      .mockResolvedValueOnce(okJson({ status: 'success', data: { title: 'Trobat' } }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await flushRetries(fetchLinkPreview('https://example.com'), 2)

    expect(result.title).toBe('Trobat')
  })

  it('throws when the HTTP response is not ok', async () => {
    vi.stubGlobal('fetch', mockFetchOnce({}, false))

    await expect(fetchLinkPreview('https://example.com')).rejects.toThrow(
      "No s'ha pogut obtenir informació del link"
    )
  })

  it('throws when the API reports a non-success status', async () => {
    vi.stubGlobal('fetch', mockFetchOnce({ status: 'fail' }))

    await expect(fetchLinkPreview('https://example.com')).rejects.toThrow(
      "No s'ha pogut obtenir informació del link"
    )
  })
})
