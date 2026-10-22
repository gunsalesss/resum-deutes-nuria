// Troba el primer mes (dels últims 24) que encara no té cap mensualitat
// registrada; si tots els últims 24 mesos ja en tenen, suggereix el mes actual.
export function nextPendingMonth(mensualitats, now = new Date()) {
  const existing = new Set(mensualitats.map((m) => `${m.year}-${m.month}`))
  let d = new Date(now.getFullYear(), now.getMonth() - 24, 1)
  const limit = new Date(now.getFullYear(), now.getMonth(), 1)
  let candidate = { year: now.getFullYear(), month: now.getMonth() + 1 }
  while (d <= limit) {
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`
    if (!existing.has(key)) {
      candidate = { year: d.getFullYear(), month: d.getMonth() + 1 }
      break
    }
    d.setMonth(d.getMonth() + 1)
  }
  return candidate
}
