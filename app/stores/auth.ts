import { defineStore } from 'pinia'
import type { User, LoginRequest, LoginResponse } from '~/types/api'
import { ref, computed } from 'vue'
// import { useApi } from '@/composables/useApi'

export const useAuthStore = defineStore('auth', () => {
    const token = ref<string | null>(null)
    const user = ref<User | null>(null)

    const isAuthenticated = computed(() => !!token.value)
    const currentUser = computed(() => user.value)

    /**
     * Logs in a user
     * @param {LoginRequest} credentials - The credentials to log in with
     * @returns {Promise<{success: boolean, message?: string}>} - A promise that resolves to an object with a success boolean and an optional error message
     */
    async function login(credentials: LoginRequest) {
        const { apiFetch } = useApi()

        try {
            const response = await apiFetch<LoginResponse>('/login', {
                method: 'POST',
                body: credentials
            })            

            token.value = response.data?.token
            user.value = response.data?.user
            
            return { success: true }
        } catch (error: any) {
            console.error('Login failed:', error)

            let message = 'Échec de la connexion'

            if (error?.data?.message) {
                message = error.data.message
            } else if (error?.data?.errors) {
                const firstError = Object.values(error.data.errors)[0]
                if (Array.isArray(firstError) && firstError.length > 0) {
                    message = firstError[0] as string
                }
            }

            return { success: false, message }
        }
    }
    async function logout() {
        const { apiFetch } = useApi()

        try {
            if (token) {
                await apiFetch('/logout', { method: 'POST' })
            }
        } catch (error) {
            console.error('Logout failed:', error)
        } finally {
            clearAuth()
            navigateTo('/login')
        }
    }

    function clearAuth() {
        token.value = null
        user.value = null
    }
    async function checkAuth(): Promise<boolean> {
        return !!token.value
    }

    return {
        token,
        user,
        isAuthenticated,
        currentUser,
        login,
        logout,
        checkAuth,
        clearAuth,
    }
},
    {
        // 🔥 PERSISTANCE AUTOMATIQUE
        persist: {
            key: 'vta-auth',
            storage: persistedState.localStorage,
            paths: ['token', 'user'],
        } as any
    })