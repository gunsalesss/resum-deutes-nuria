import { useState } from 'react'
import { TIPUS } from '../lib/constants'
import { addEntry } from '../lib/entries'

export default function RomanentForm() {
  const [label, setLabel] = useState('')
  const [year, setYear] = useState(new Date().getFullYear())
  const [amount, setAmount] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!label || !amount) return
    setSaving(true)
    try {
      await addEntry({
        type: TIPUS.ROMANENT,
        label,
        amount: Number(amount) || 0,
        year: Number(year),
      })
      setLabel('')
      setAmount('')
    } catch {
      // ja notificat via toast
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="inline-form" onSubmit={handleSubmit}>
      <input
        placeholder="Descripció (p.ex. Acumulat 2025)"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        className="label-input"
        required
      />
      <input
        type="number"
        value={year}
        onChange={(e) => setYear(e.target.value)}
        className="year-input"
      />
      <input
        type="number"
        step="0.01"
        placeholder="Import €"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="amount-input"
        required
      />
      <button type="submit" disabled={saving}>
        Afegir
      </button>
    </form>
  )
}
