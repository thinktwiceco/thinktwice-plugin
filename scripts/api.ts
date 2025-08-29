import { Fingerprints } from './fingerprints'
import * as z from 'zod'

const zApiResponse = z.object({
  success: z.boolean(),
  status_code: z.number(),
  data: z.any(),
  user_id: z.coerce.string(),
  session_id: z.string(),
  error_message: z.string().optional().nullable()
})

export type ApiResponse = z.infer<typeof zApiResponse>

export class ApiClient {
  private baseUrl: string
  private fingerprints: Fingerprints

  constructor() {
    // Get BASE_URL from environment, fallback to localhost if not set
    this.baseUrl = process.env.BASE_URL || 'http://localhost:8000'
    this.fingerprints = new Fingerprints()
  }

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'tt-x-api-key': null as any, // For now, leave as null
      'tt-x-session-id': this.fingerprints.getSessionId() || '',
      'tt-x-fingerprints': this.fingerprints.getFingerprints() || '',
      'tt-x-user-id': this.fingerprints.getUserId() || ''
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders()
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    const parsedResponse = zApiResponse.parse(data)
    const userId = parsedResponse.user_id
    this.fingerprints.saveUserId(userId)
    return parsedResponse
  }

  async post<T>(endpoint: string, data: any): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const responseData = await response.json()
    const parsedResponse = zApiResponse.parse(responseData)
    const userId = parsedResponse.user_id
    this.fingerprints.saveUserId(userId)
    return parsedResponse
  }

  async put<T>(endpoint: string, data: any): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const responseData = await response.json()
    const parsedResponse = zApiResponse.parse(responseData)
    const userId = parsedResponse.user_id
    this.fingerprints.saveUserId(userId)
    return parsedResponse
  }

  async delete<T>(endpoint: string): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    const parsedResponse = zApiResponse.parse(data)
    const userId = parsedResponse.user_id
    this.fingerprints.saveUserId(userId)
    return parsedResponse
  }
}
