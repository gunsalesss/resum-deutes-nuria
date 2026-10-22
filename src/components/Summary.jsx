import { formatEuros } from '../lib/constants'

export default function Summary({ totalDeute, totalCompres, saldoPendent, onSelectTab }) {
  const aFavorNostre = saldoPendent < 0

  return (
    <section className="stat-grid">
      <div className={`stat-card stat-card-main ${aFavorNostre ? 'is-positive' : 'is-warning'}`}>
        <span className="stat-label">
          {aFavorNostre ? 'Al nostre favor' : 'Deute pendent amb la Núria'}
        </span>
        <span className="stat-value">{formatEuros(Math.abs(saldoPendent))}</span>
      </div>

      <button className="stat-card stat-card-link" onClick={() => onSelectTab('mensualitats')}>
        <span className="stat-label">Deutes acumulats</span>
        <span className="stat-value stat-value-sm">{formatEuros(totalDeute)}</span>
      </button>

      <button className="stat-card stat-card-link" onClick={() => onSelectTab('compres')}>
        <span className="stat-label">Compres fetes</span>
        <span className="stat-value stat-value-sm">{formatEuros(totalCompres)}</span>
      </button>
    </section>
  )
}
