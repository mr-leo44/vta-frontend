import { defineStore } from 'pinia'

interface User {
  id: number
  username: string
  email?: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null as string | null,
    user: null as User | null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token
  },

  actions: {
    async login(username: string, password: string) {
      const { apiFetch } = useApi()
      
      try {
        const response: any = await apiFetch('/login', {
          method: 'POST',
          body: { username, password }
        })
        
        this.token = response.token
        this.user = response.user
        
        if (import.meta.client) {
          localStorage.setItem('auth_token', response.token)
        }
        
        return { success: true }
      } catch (error: any) {
        console.error('Login failed:', error)
        return { 
          success: false, 
          message: error?.data?.message || 'Login failed' 
        }
      }
    },

    async logout() {
      const { apiFetch } = useApi()
      
      try {
        await apiFetch('/logout', { method: 'POST' })
      } catch (error) {
        console.error('Logout failed:', error)
      } finally {
        this.token = null
        this.user = null
        
        if (import.meta.client) {
          localStorage.removeItem('auth_token')
        }
        
        navigateTo('/login')
      }
    },

    initAuth() {
      if (import.meta.client) {
        const token = localStorage.getItem('auth_token')
        if (token) {
          this.token = token
        }
      }
    }
  }
})