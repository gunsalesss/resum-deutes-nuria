import { useEffect, useState } from 'react'
import { onToast } from '../lib/toast'

export default function ToastHost() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    return onToast((toast) => {
      setToasts((prev) => [...prev, toast])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id))
      }, 2600)
    })
  }, [])

  if (toasts.length === 0) return null

  return (
    <div className="toast-host">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.message}
        </div>
      ))}
    </div>
  )
}
