export const useApi = () => {
  const config = useRuntimeConfig()
  
  const getAuthStore = () => {
    try {
      return useAuthStore()
    } catch {
      return null
    }
  }

  const apiFetch = $fetch.create({
    baseURL: config.public.apiBase,
    
    onRequest({ options }) {
      const authStore = getAuthStore()
      const token = authStore?.token
      
      if (token) {
        options.headers = new Headers(options.headers as HeadersInit)
        options.headers.set('Authorization', `Bearer ${token}`)
      }
    },
    
    onResponseError({ response }) {
      if (response.status === 401) {
        const authStore = getAuthStore()
        if (authStore) {
          authStore.clearAuth()
          navigateTo('/login')
        }
      }
    }
  })

  return { apiFetch }
}