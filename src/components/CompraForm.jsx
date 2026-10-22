import { useState } from 'react'
import { TIPUS } from '../lib/constants'
import { addEntry } from '../lib/entries'
import { fetchLinkPreview } from '../lib/linkPreview'

export default function CompraForm() {
  const [link, setLink] = useState('')
  const [label, setLabel] = useState('')
  const [image, setImage] = useState('')
  const [amount, setAmount] = useState('')
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleFetchPreview() {
    if (!link) return
    setLoadingPreview(true)
    setError('')
    try {
      const preview = await fetchLinkPreview(link)
      if (preview.title) setLabel(preview.title)
      if (preview.image) setImage(preview.image)
      if (!preview.title && !preview.image) {
        setError('No s\'ha trobat ni títol ni imatge, omple-ho a mà.')
      }
    } catch {
      setError('No s\'ha pogut obtenir informació del link. Omple-ho a mà.')
    } finally {
      setLoadingPreview(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!label || !amount) return
    setSaving(true)
    try {
      await addEntry({
        type: TIPUS.COMPRA,
        label,
        amount: Number(amount) || 0,
        link: link || null,
        image: image || null,
        year: new Date().getFullYear(),
      })
      setLink('')
      setLabel('')
      setImage('')
      setAmount('')
      setError('')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="compra-form" onSubmit={handleSubmit}>
      <div className="compra-form-row">
        <input
          type="url"
          placeholder="Link d'Amazon (opcional)"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          className="link-input"
        />
        <button type="button" onClick={handleFetchPreview} disabled={!link || loadingPreview}>
          {loadingPreview ? 'Carregant…' : 'Obtenir dades'}
        </button>
      </div>
      {error && <p className="form-error">{error}</p>}
      <div className="compra-form-row">
        {image && (
          <img src={image} alt="" className="compra-preview-img" />
        )}
        <input
          placeholder="Nom de l'article"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="label-input"
          required
        />
        <input
          type="number"
          step="0.01"
          placeholder="Preu €"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="amount-input"
          required
        />
        <button type="submit" disabled={saving}>
          Afegir compra
        </button>
      </div>
    </form>
  )
}
