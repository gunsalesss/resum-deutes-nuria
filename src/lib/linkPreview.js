// Fa servir microlink.io (gratuït, sense API key per a volums baixos) per obtenir
// títol i imatge a partir d'un link (p.ex. Amazon). El preu normalment no ve inclòs
// a les metadades públiques d'Amazon, així que caldrà introduir-lo a mà.
export async function fetchLinkPreview(url) {
  const endpoint = `https://api.microlink.com/?url=${encodeURIComponent(url)}&meta=false&palette=false`
  const res = await fetch(endpoint)
  if (!res.ok) throw new Error('No s\'ha pogut obtenir informació del link')
  const json = await res.json()
  if (json.status !== 'success') throw new Error('No s\'ha pogut obtenir informació del link')
  const { title, image, description } = json.data
  return {
    title: title || '',
    image: image?.url || '',
    description: description || '',
  }
}
