import { useState } from 'react'
import { formatEuros, MESOS } from '../lib/constants'
import { removeEntry, setSaldada, updateEntry } from '../lib/entries'

export default function EntryRow({ entry }) {
  const [editing, setEditing] = useState(false)
  const [amount, setAmount] = useState(entry.amount)

  const subtitle = []
  if (entry.month != null) subtitle.push(`${MESOS[entry.month - 1]} ${entry.year}`)
  else if (entry.year) subtitle.push(`${entry.year}`)
  if (entry.note) subtitle.push(entry.note)

  async function handleDelete() {
    if (window.confirm(`Segur que vols eliminar "${entry.label}"?`)) {
      await removeEntry(entry.id)
    }
  }

  async function handleSaveAmount() {
    const n = Number(amount)
    if (!Number.isNaN(n)) {
      await updateEntry(entry.id, { amount: n })
    }
    setEditing(false)
  }

  return (
    <div className={`entry-row ${entry.saldada ? 'saldada' : ''}`}>
      {entry.image && (
        <a href={entry.link} target="_blank" rel="noreferrer" className="entry-thumb">
          <img src={entry.image} alt="" />
        </a>
      )}
      <div className="entry-info">
        <div className="entry-title-line">
          {entry.link ? (
            <a href={entry.link} target="_blank" rel="noreferrer" className="entry-label">
              {entry.label}
            </a>
          ) : (
            <span className="entry-label">{entry.label}</span>
          )}
        </div>
        {subtitle.length > 0 && <span className="entry-subtitle">{subtitle.join(' · ')}</span>}
      </div>
      <div className="entry-amount-col">
        {editing ? (
          <input
            type="number"
            step="0.01"
            autoFocus
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onBlur={handleSaveAmount}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveAmount()}
          />
        ) : (
          <button className="entry-amount" onClick={() => setEditing(true)}>
            {formatEuros(entry.amount)}
          </button>
        )}
      </div>
      <label className="entry-saldada">
        <input
          type="checkbox"
          checked={!!entry.saldada}
          onChange={(e) => setSaldada(entry.id, e.target.checked)}
        />
        Saldada
      </label>
      <button className="entry-delete" title="Eliminar" onClick={handleDelete}>
        ✕
      </button>
    </div>
  )
}
