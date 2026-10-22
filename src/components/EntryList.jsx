import EntryRow from './EntryRow'
import { formatEuros } from '../lib/constants'

export default function EntryList({ entries, groupByYear = false, emptyText = 'Encara no hi ha res aquí.' }) {
  if (entries.length === 0) {
    return <p className="empty-text">{emptyText}</p>
  }

  if (!groupByYear) {
    return (
      <div className="entry-list">
        {entries.map((e) => (
          <EntryRow key={e.id} entry={e} />
        ))}
      </div>
    )
  }

  const byYear = {}
  for (const e of entries) {
    const y = e.year || 'Sense any'
    byYear[y] = byYear[y] || []
    byYear[y].push(e)
  }
  const years = Object.keys(byYear).sort((a, b) => b - a)

  return (
    <div className="entry-list grouped">
      {years.map((year) => {
        const items = byYear[year]
        const subtotal = items.reduce((acc, e) => acc + (e.saldada ? 0 : Number(e.amount) || 0), 0)
        return (
          <div key={year} className="year-group">
            <div className="year-group-header">
              <span>{year}</span>
              <span>{formatEuros(subtotal)} pendent</span>
            </div>
            {items.map((e) => (
              <EntryRow key={e.id} entry={e} />
            ))}
          </div>
        )
      })}
    </div>
  )
}
