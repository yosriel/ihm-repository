import { useEffect, useState } from "react";

export interface HealthResponse {
  status: "UP";
  application: string;
}
export class ApiError extends Error {
  status: number;
  field?: string;
  constructor(message: string, status = 0, field?: string) {
    super(message);
    this.status = status;
    this.field = field;
  }
}
const base = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/+$/, "");
export async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  try {
    const response = await fetch(`${base}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
      signal: init.signal
        ? AbortSignal.any([init.signal, AbortSignal.timeout(15000)])
        : AbortSignal.timeout(15000),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok)
      throw new ApiError(
        data?.message ||
          "No pudimos completar la solicitud. Inténtalo de nuevo.",
        response.status,
        data?.field,
      );
    if (data === null)
      throw new ApiError(
        "El servicio devolvió una respuesta que no pudimos leer.",
      );
    return data as T;
  } catch (error) {
    if (error instanceof ApiError || init.signal?.aborted) throw error;
    throw new ApiError(
      "No pudimos conectar con el servicio. Conservamos tu selección; vuelve a intentarlo.",
    );
  }
}
export function getHealth(signal: AbortSignal) {
  return request<HealthResponse>("/health", { signal });
}
export function useRemote<T>(path: string | null) {
  const [retryCount, retry] = useState(0);
  const requestKey = JSON.stringify([path, retryCount]);
  const [state, setState] = useState<{
    key: string;
    data?: T;
    error?: string;
    loading: boolean;
  }>({ key: "", loading: !!path });
  useEffect(() => {
    if (!path) return;
    const abort = new AbortController();
    request<T>(path, { signal: abort.signal })
      .then((data) => {
        if (!abort.signal.aborted)
          setState({ key: requestKey, data, loading: false });
      })
      .catch((error) => {
        if (!abort.signal.aborted)
          setState({ key: requestKey, error: error.message, loading: false });
      });
    return () => abort.abort();
  }, [path, requestKey]);
  return {
    data: state.key === requestKey ? state.data : undefined,
    error: state.key === requestKey ? state.error : undefined,
    loading: state.key === requestKey ? state.loading : !!path,
    retry: () => retry((n) => n + 1),
  };
}
