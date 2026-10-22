let listeners = []
let idSeq = 0

export function onToast(listener) {
  listeners.push(listener)
  return () => {
    listeners = listeners.filter((l) => l !== listener)
  }
}

export function notify(message, type = 'success') {
  const toast = { id: ++idSeq, message, type }
  listeners.forEach((l) => l(toast))
}
