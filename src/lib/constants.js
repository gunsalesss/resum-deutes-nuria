export const MESOS = [
  'Gener', 'Febrer', 'Març', 'Abril', 'Maig', 'Juny',
  'Juliol', 'Agost', 'Setembre', 'Octubre', 'Novembre', 'Desembre',
]

export const TIPUS = {
  MENSUALITAT: 'mensualitat',
  ROMANENT: 'romanent',
  COMPRA: 'compra',
}

export const DEFAULT_MENSUALITAT = {
  label: 'Movistar',
  amount: 24,
}

export function formatEuros(value) {
  const n = Number(value) || 0
  return n.toLocaleString('ca-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
}
