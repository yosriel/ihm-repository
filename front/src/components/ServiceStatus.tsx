import { useEffect, useState } from 'react'
import { getHealth } from '../services/api'

type ConnectionStatus = 'checking' | 'connected' | 'unavailable'

const statusLabels: Record<ConnectionStatus, string> = {
  checking: 'Comprobando conexión…',
  connected: 'Servicio conectado',
  unavailable: 'Servicio sin conexión',
}

export function ServiceStatus() {
  const [status, setStatus] = useState<ConnectionStatus>('checking')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    getHealth(controller.signal)
      .then(() => {
        if (!controller.signal.aborted) setStatus('connected')
      })
      .catch(() => {
        if (!controller.signal.aborted) setStatus('unavailable')
      })

    return () => controller.abort()
  }, [attempt])

  function retry() {
    setStatus('checking')
    setAttempt((value) => value + 1)
  }

  return (
    <div className="service-status">
      <span className={`status-indicator ${status}`} aria-hidden="true" />
      <span role="status" aria-live="polite">{statusLabels[status]}</span>
      {status === 'unavailable' && (
        <button className="retry-button" type="button" onClick={retry}>
          Reintentar
        </button>
      )}
    </div>
  )
}
