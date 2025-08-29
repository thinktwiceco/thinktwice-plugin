import { useState, useCallback } from 'react'
import { ApiClient, type ApiResponse } from '../scripts/api'
import * as z from 'zod'

interface UseFetchState<T> {
  loading: boolean
  success: boolean
  data: T | null
  errorMessage: string | null
}

interface UseFetchOptions<T> {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: any
  dataValidation?: z.ZodType<T>
}

export function useFetch<T = any>() {
  const [state, setState] = useState<UseFetchState<T>>({
    loading: false,
    success: false,
    data: null,
    errorMessage: null
  })

  const api = new ApiClient()

  const fetchData = useCallback(async (
    endpoint: string,
    options: UseFetchOptions<T> = {}
  ): Promise<T> => {
    const { method = 'GET', body, dataValidation } = options

    setState(prev => ({
      ...prev,
      loading: true,
      success: false,
      errorMessage: null
    }))

    try {
      let response: ApiResponse
      switch (method) {
        case 'GET':
          response = await api.get(endpoint)
          break
        case 'POST':
          response = await api.post(endpoint, body)
          break
        case 'PUT':
          response = await api.put(endpoint, body)
          break
        case 'DELETE':
          response = await api.delete(endpoint)
          break
        default:
          throw new Error(`Unsupported HTTP method: ${method}`)
      }

      setState({
        loading: false,
        success: response.success,
        data: response.data,
        errorMessage: response.error_message || null
      })

      console.log("--- RESPONSE DATA --> ", response)

      if (dataValidation) {
        const parsedData = dataValidation.parse(response.data)
        return parsedData as T
      }

      return response.data as T
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'

      setState({
        loading: false,
        success: false,
        data: null,
        errorMessage
      })

      throw error
    }
  }, [api])

  const reset = useCallback(() => {
    setState({
      loading: false,
      success: false,
      data: null,
      errorMessage: null
    })
  }, [])

  return {
    ...state,
    fetchData,
    reset
  }
}