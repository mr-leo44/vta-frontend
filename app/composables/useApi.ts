// Track token expiration to avoid multiple redirects
let isRedirectingDueToExpiration = false

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
      // Handle 401 Unauthorized — token has expired or is invalid
      if (response.status === 401) {
        // Prevent multiple redirects if several requests fail simultaneously
        if (!isRedirectingDueToExpiration) {
          isRedirectingDueToExpiration = true
          
          const authStore = getAuthStore()
          if (authStore) {
            // Clear authentication
            authStore.clearAuth()
            
            // Show notification to user
            const { warning } = useToast()
            warning('Session expirée', 'Votre session a expiré. Veuillez vous reconnecter.')
            
            // Redirect to login after a short delay to allow UI to update
            setTimeout(() => {
              navigateTo('/login?reason=expired')
              // Reset flag after navigation
              setTimeout(() => {
                isRedirectingDueToExpiration = false
              }, 1000)
            }, 300)
          }
        }
      }
    }
  })

  return { apiFetch }
}