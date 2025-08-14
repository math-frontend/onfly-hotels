import type { ApiResponse, City } from '~/types'

const API_BASE_URL = 'http://localhost:3001/api'

export const useApi = () => {
  const get = async <T>(endpoint: string): Promise<T> => {
    try {
      const response = await fetch(`${API_BASE_URL}/${endpoint}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      throw error
    }
  }

  const post = async <T>(endpoint: string, data: any): Promise<T> => {
    try {
      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      throw error
    }
  }

  const put = async <T>(endpoint: string, data: any): Promise<T> => {
    try {
      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      throw error
    }
  }

  const del = async (endpoint: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      throw error
    }
  }

  // Cities API
  const getCities = () => get<City[]>('cities')
  const searchCities = (query: string) => get<City[]>(`cities?name_like=${encodeURIComponent(query)}`)

  return {
    // Generic methods
    get,
    post,
    put,
    del,

    // Cities
    getCities,
    searchCities,
  }
}
