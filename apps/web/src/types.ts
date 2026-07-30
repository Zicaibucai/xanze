export interface Role {
  id: number
  code: string
  name: string
  description?: string
  enabled: boolean
}

export interface Department {
  id: number
  code: string
  name: string
  enabled: boolean
}

export interface User {
  id: number
  username: string
  display_name: string
  email?: string
  enabled: boolean
  department?: Department
  roles: Role[]
}

export interface AuthResponse {
  user: User
  expires_at: string
}

export interface ApiErrorPayload {
  request_id: string
  code: string
  message: string
  details?: Record<string, string>
  timestamp: string
}

