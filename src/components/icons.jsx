const common = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export function HomeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" {...common} {...props}>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
    </svg>
  )
}

export function CalendarIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" {...common} {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 3v4M16 3v4" />
    </svg>
  )
}

export function BagIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" {...common} {...props}>
      <path d="M6 8h12l1 12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L6 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  )
}

export function ArchiveIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" {...common} {...props}>
      <rect x="3" y="4" width="18" height="5" rx="1" />
      <path d="M5 9v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9" />
      <path d="M10 13h4" />
    </svg>
  )
}

export function PlusIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...common} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}
