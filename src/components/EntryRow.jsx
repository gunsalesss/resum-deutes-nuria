import { useState } from 'react'
import { formatEuros, MESOS } from '../lib/constants'
import { removeEntry, setSaldada } from '../lib/entries'
import EntryEditForm from './EntryEditForm'

export default function EntryRow({ entry }) {
  const [editing, setEditing] = useState(false)

  const subtitle = []
  if (entry.month != null) subtitle.push(`${MESOS[entry.month - 1]} ${entry.year}`)
  else if (entry.year) subtitle.push(`${entry.year}`)
  if (entry.note) subtitle.push(entry.note)

  async function handleDelete(e) {
    e.stopPropagation()
    if (window.confirm(`Segur que vols eliminar "${entry.label}"?`)) {
      await removeEntry(entry.id)
    }
  }

  if (editing) {
    return (
      <div className="entry-row entry-row-editing">
        <EntryEditForm entry={entry} onDone={() => setEditing(false)} />
      </div>
    )
  }

  return (
    <div
      className={`entry-row entry-row-clickable ${entry.saldada ? 'saldada' : ''}`}
      onClick={() => setEditing(true)}
    >
      {entry.image && (
        <a
          href={entry.link}
          target="_blank"
          rel="noreferrer"
          className="entry-thumb"
          onClick={(e) => e.stopPropagation()}
        >
          <img src={entry.image} alt="" />
        </a>
      )}
      <div className="entry-info">
        <div className="entry-title-line">
          {entry.link ? (
            <a
              href={entry.link}
              target="_blank"
              rel="noreferrer"
              className="entry-label"
              onClick={(e) => e.stopPropagation()}
            >
              {entry.label}
            </a>
          ) : (
            <span className="entry-label">{entry.label}</span>
          )}
        </div>
        {subtitle.length > 0 && <span className="entry-subtitle">{subtitle.join(' · ')}</span>}
      </div>
      <div className="entry-amount-col">
        <span className="entry-amount">{formatEuros(entry.amount)}</span>
      </div>
      <label className="entry-saldada" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={!!entry.saldada}
          onChange={(e) => setSaldada(entry.id, e.target.checked)}
        />
        <span>Saldada</span>
      </label>
      <button className="entry-delete" title="Eliminar" onClick={handleDelete}>
        ✕
      </button>
    </div>
  )
}
