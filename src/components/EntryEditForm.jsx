import { useState } from 'react'
import { MESOS, TIPUS } from '../lib/constants'
import { updateEntry } from '../lib/entries'
import { fetchLinkPreview } from '../lib/linkPreview'

export default function EntryEditForm({ entry, onDone }) {
  const [label, setLabel] = useState(entry.label || '')
  const [amount, setAmount] = useState(entry.amount)
  const [link, setLink] = useState(entry.link || '')
  const [image, setImage] = useState(entry.image || '')
  const [year, setYear] = useState(entry.year || new Date().getFullYear())
  const [month, setMonth] = useState(entry.month || 1)
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

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
      setError('No s\'ha pogut obtenir informació del link.')
    } finally {
      setLoadingPreview(false)
    }
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const data = {
        label,
        amount: Number(amount) || 0,
        link: link || null,
        image: image || null,
      }
      if (entry.type === TIPUS.MENSUALITAT) {
        data.year = Number(year)
        data.month = Number(month)
      } else if (entry.type === TIPUS.ROMANENT) {
        data.year = Number(year)
      }
      await updateEntry(entry.id, data)
      onDone()
    } catch {
      // ja notificat via toast
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="edit-form" onSubmit={handleSave}>
      <div className="edit-form-row">
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

      <div className="edit-form-row">
        {image && <img src={image} alt="" className="compra-preview-img" />}
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="label-input"
          placeholder="Concepte"
          required
        />
      </div>

      <div className="edit-form-row">
        {entry.type === TIPUS.MENSUALITAT && (
          <select value={month} onChange={(e) => setMonth(e.target.value)}>
            {MESOS.map((m, i) => (
              <option key={m} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
        )}
        {(entry.type === TIPUS.MENSUALITAT || entry.type === TIPUS.ROMANENT) && (
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="year-input"
          />
        )}
        <input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="amount-input"
          required
        />
      </div>

      <div className="edit-form-actions">
        <button type="button" className="btn-secondary" onClick={onDone}>
          Cancel·lar
        </button>
        <button type="submit" disabled={saving}>
          Desar
        </button>
      </div>
    </form>
  )
}
