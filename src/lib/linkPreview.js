// Fa servir microlink.io (gratuït, sense API key per a volums baixos) per obtenir
// títol i imatge a partir d'un link (p.ex. Amazon). El preu normalment no ve inclòs
// a les metadades públiques d'Amazon, així que caldrà introduir-lo a mà.
// Nota: Amazon bloqueja sovint els scrapers, així que de vegades no es troba
// cap dada tot i que el link és correcte — en aquest cas cal omplir-ho a mà.
async function fetchMeta(url) {
  const endpoint = `https://api.microlink.io/?url=${encodeURIComponent(url)}&meta=false&palette=false`
  const res = await fetch(endpoint)
  if (!res.ok) throw new Error('No s\'ha pogut obtenir informació del link')
  const json = await res.json()
  if (json.status !== 'success') throw new Error('No s\'ha pogut obtenir informació del link')
  return json.data
}

export async function fetchLinkPreview(url) {
  let data = await fetchMeta(url)

  // Els links curts (amzn.eu, amzn.to...) sovint resolen a una URL amb
  // paràmetres de tracking que Amazon no serveix amb metadades completes.
  // Ho reintentem amb la URL resolta i neta.
  if (!data.title && !data.image && data.url) {
    const clean = data.url.split('?')[0]
    if (clean !== url) {
      try {
        data = await fetchMeta(clean)
      } catch {
        // es queda amb el resultat anterior (buit)
      }
    }
  }

  return {
    title: data.title || '',
    image: data.image?.url || '',
    description: data.description || '',
  }
}
