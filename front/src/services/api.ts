export interface HealthResponse {
  status: 'UP'
  application: string
}

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '')

export async function getHealth(signal: AbortSignal): Promise<HealthResponse> {
  const response = await fetch(`${apiBaseUrl}/health`, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.any([signal, AbortSignal.timeout(5000)]),
  })

  if (!response.ok) {
    throw new Error('No se pudo consultar el servicio.')
  }

  const data: unknown = await response.json()

  if (
    !data ||
    typeof data !== 'object' ||
    !('status' in data) ||
    data.status !== 'UP' ||
    !('application' in data) ||
    typeof data.application !== 'string'
  ) {
    throw new Error('El servicio devolvió una respuesta inesperada.')
  }

  return { status: data.status, application: data.application }
}
