import { useState } from 'react'
import { DEFAULT_MENSUALITAT, MESOS, TIPUS } from '../lib/constants'
import { addEntry } from '../lib/entries'

export default function MensualitatForm({ onDone }) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [label, setLabel] = useState(DEFAULT_MENSUALITAT.label)
  const [amount, setAmount] = useState(DEFAULT_MENSUALITAT.amount)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await addEntry({
        type: TIPUS.MENSUALITAT,
        label: label || 'Movistar',
        amount: Number(amount) || 0,
        year: Number(year),
        month: Number(month),
      })
      onDone?.()
    } catch {
      // ja notificat via toast
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="inline-form" onSubmit={handleSubmit}>
      <input
        className="label-input"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Concepte"
      />
      <select value={month} onChange={(e) => setMonth(e.target.value)}>
        {MESOS.map((m, i) => (
          <option key={m} value={i + 1}>
            {m}
          </option>
        ))}
      </select>
      <input
        type="number"
        value={year}
        onChange={(e) => setYear(e.target.value)}
        className="year-input"
      />
      <input
        type="number"
        step="0.01"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="amount-input"
      />
      <button type="submit" disabled={saving}>
        Afegir
      </button>
    </form>
  )
}
