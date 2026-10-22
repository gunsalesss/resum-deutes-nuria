import { HomeIcon, CalendarIcon, BagIcon, ArchiveIcon } from './icons'

const ITEMS = [
  { key: 'resum', label: 'Resum', Icon: HomeIcon },
  { key: 'mensualitats', label: 'Deutes', Icon: CalendarIcon },
  { key: 'compres', label: 'Compres', Icon: BagIcon },
  { key: 'romanents', label: 'Romanents', Icon: ArchiveIcon },
]

export default function BottomNav({ tab, onChange }) {
  return (
    <nav className="bottom-nav">
      {ITEMS.map(({ key, label, Icon }) => (
        <button
          key={key}
          className={tab === key ? 'active' : ''}
          onClick={() => onChange(key)}
        >
          <Icon />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}
