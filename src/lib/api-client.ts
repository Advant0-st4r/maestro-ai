interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        }
      }

      return {
        success: true,
        data: data,
      }
    } catch (error) {
      console.error('API request failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      }
    }
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    const url = new URL(endpoint, this.baseUrl)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value)
      })
    }

    return this.request<T>(url.toString(), { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async postFormData<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

// Create API client instance
export const apiClient = new ApiClient()

// Meeting-specific API methods
export const meetingApi = {
  async upload(file: File, context?: string) {
    const formData = new FormData()
    formData.append('file', file)
    if (context) {
      formData.append('context', context)
    }

    return apiClient.postFormData<{ meetingId: string; message: string }>('/api/upload', formData)
  },

  async getActions(meetingId: string) {
    return apiClient.get('/api/get-actions', { meetingId })
  },

  async verifyActions(meetingId: string, actions: any[]) {
    return apiClient.post('/api/verify', { meetingId, actions })
  },

  async uploadProfile(profileData: any) {
    return apiClient.post('/api/profile', profileData)
  },
}

// Analytics API methods
export const analyticsApi = {
  async trackEvent(event: string, properties?: Record<string, any>) {
    // This would typically send to your analytics service
    console.log('Analytics event:', event, properties)
  },

  async getDashboardData(userId: string) {
    // Mock implementation - in production, fetch from database
    return {
      success: true,
      data: {
        timeSaved: 12,
        actionsCompleted: 84,
        revenueActions: { completed: 18, total: 22, value: 340000 },
        strategicInitiatives: 5,
      },
    }
  },
}

// Error handling utilities
export const handleApiError = (error: any): string => {
  if (typeof error === 'string') {
    return error
  }
  
  if (error?.message) {
    return error.message
  }
  
  if (error?.error) {
    return error.error
  }
  
  return 'An unexpected error occurred'
}

// Retry utility for failed requests
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      if (i === maxRetries - 1) {
        throw lastError
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
    }
  }
  
  throw lastError!
}
