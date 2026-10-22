import { CalendarIcon, BagIcon, ArchiveIcon } from './icons'

const ITEMS = [
  { key: 'mensualitats', label: 'Deute', Icon: CalendarIcon },
  { key: 'compres', label: 'Compra', Icon: BagIcon },
  { key: 'romanents', label: 'Romanent', Icon: ArchiveIcon },
]

export default function QuickCreate({ onSelect }) {
  return (
    <section className="quick-create">
      <h2>Afegir</h2>
      <div className="quick-create-row">
        {ITEMS.map(({ key, label, Icon }) => (
          <button key={key} onClick={() => onSelect(key)}>
            <span className="quick-create-icon">
              <Icon />
            </span>
            {label}
          </button>
        ))}
      </div>
    </section>
  )
}
