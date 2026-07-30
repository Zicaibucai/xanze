import type { ApiErrorPayload } from './types'

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly requestId?: string
  readonly details?: Record<string, string>

  constructor(status: number, payload?: Partial<ApiErrorPayload>) {
    super(payload?.message ?? `请求失败（${status}）`)
    this.name = 'ApiError'
    this.status = status
    this.code = payload?.code ?? 'REQUEST_FAILED'
    this.requestId = payload?.request_id
    this.details = payload?.details
  }
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers)
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(path, {
    ...init,
    credentials: 'include',
    headers,
  })

  if (!response.ok) {
    let payload: Partial<ApiErrorPayload> | undefined
    try {
      payload = (await response.json()) as ApiErrorPayload
    } catch {
      payload = undefined
    }
    throw new ApiError(response.status, payload)
  }

  if (response.status === 204) {
    return undefined as T
  }
  return (await response.json()) as T
}

