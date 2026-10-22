import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchLinkPreview } from './linkPreview'

function mockFetchOnce(body, ok = true) {
  return vi.fn().mockResolvedValueOnce({
    ok,
    json: () => Promise.resolve(body),
  })
}

describe('fetchLinkPreview', () => {
  afterEach(() => {
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

  it('returns title, image and description on success', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetchOnce({
        status: 'success',
        data: { title: 'Un producte', image: { url: 'https://img/1.jpg' }, description: 'desc' },
      })
    )

    const result = await fetchLinkPreview('https://www.amazon.es/dp/ABC123')

    expect(result).toEqual({
      title: 'Un producte',
      image: 'https://img/1.jpg',
      description: 'desc',
    })
  })

  it('retries with the resolved, query-stripped url when a short link returns no data', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            status: 'success',
            data: { url: 'https://www.amazon.es/dp/ABC123?ref=tracking123' },
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            status: 'success',
            data: { title: 'Trobat al segon intent', image: { url: 'https://img/2.jpg' } },
          }),
      })
    vi.stubGlobal('fetch', fetchMock)

    const result = await fetchLinkPreview('https://amzn.eu/d/short')

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock.mock.calls[1][0]).toContain(
      encodeURIComponent('https://www.amazon.es/dp/ABC123')
    )
    expect(result.title).toBe('Trobat al segon intent')
  })

  it('returns empty fields when nothing is found after retrying', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ status: 'success', data: { url: 'https://x.com/final?ref=1' } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: 'success', data: {} }),
      })
    vi.stubGlobal('fetch', fetchMock)

    const result = await fetchLinkPreview('https://short.link/x')

    expect(result).toEqual({ title: '', image: '', description: '' })
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
