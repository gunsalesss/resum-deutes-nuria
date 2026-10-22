// Fa servir microlink.io (gratuït, sense API key per a volums baixos) per obtenir
// títol i imatge a partir d'un link (p.ex. Amazon). El preu normalment no ve inclòs
// a les metadades públiques d'Amazon, així que caldrà introduir-lo a mà.
// Nota: Amazon bloqueja sovint els scrapers de manera intermitent (el mateix
// link pot fallar i funcionar al cap de pocs segons sense canviar res), així
// que ho reintentem unes quantes vegades abans de rendir-nos.
const MAX_ATTEMPTS = 3
const RETRY_DELAY_MS = 700

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchMeta(url) {
  const endpoint = `https://api.microlink.io/?url=${encodeURIComponent(url)}&meta=false&palette=false`
  const res = await fetch(endpoint)
  if (!res.ok) throw new Error('No s\'ha pogut obtenir informació del link')
  const json = await res.json()
  if (json.status !== 'success') throw new Error('No s\'ha pogut obtenir informació del link')
  return json.data
}

function hasContent(data) {
  return Boolean(data?.title || data?.image)
}

export async function fetchLinkPreview(url) {
  let data = await fetchMeta(url)
  let effectiveUrl = url

  // Els links curts (amzn.eu, amzn.to...) resolen a una URL amb paràmetres de
  // tracking que Amazon no sol servir amb metadades completes; a partir d'ara
  // reintentem amb la URL resolta i neta.
  if (!hasContent(data) && data.url) {
    const clean = data.url.split('?')[0]
    if (clean !== effectiveUrl) effectiveUrl = clean
  }

  for (let attempt = 2; attempt <= MAX_ATTEMPTS && !hasContent(data); attempt++) {
    await sleep(RETRY_DELAY_MS)
    try {
      data = await fetchMeta(effectiveUrl)
    } catch {
      // seguim intentant-ho fins a MAX_ATTEMPTS
    }
  }

  return {
    title: data.title || '',
    image: data.image?.url || '',
    description: data.description || '',
  }
}
