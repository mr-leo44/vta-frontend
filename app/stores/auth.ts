import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AuthUser, LoginRequest, LoginResponse } from '~/types/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const user  = ref<AuthUser | null>(null)

  // ─────────────────────────────────────────────────────────────────────
  // Computed
  // ─────────────────────────────────────────────────────────────────────

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const currentUser     = computed(() => user.value)
  const isAdmin         = computed(() => user.value?.role === 'admin')
  const isManager       = computed(() => user.value?.role === 'manager')
  const isAgent         = computed(() => user.value?.role === 'agent')

  /**
   * Vérifie une ou plusieurs permissions.
   * Accepte un string ou un tableau — retourne true si AU MOINS UNE correspond.
   *
   * Usage : authStore.can('flight.create')
   *         authStore.can(['flight.updateOwn', 'flight.updateAny'])
   */
  const can = computed(() => (permission: string | string[]): boolean => {
    if (!user.value) return false
    const perms = Array.isArray(permission) ? permission : [permission]
    return perms.some(p => user.value!.permissions.includes(p))
  })

  /**
   * Vérifie que TOUTES les permissions listées sont présentes.
   */
  const canAll = computed(() => (permissions: string[]): boolean => {
    if (!user.value) return false
    return permissions.every(p => user.value!.permissions.includes(p))
  })

  // ─────────────────────────────────────────────────────────────────────
  // Actions
  // ─────────────────────────────────────────────────────────────────────

  const login = async (credentials: LoginRequest): Promise<{ success: boolean; message?: string }> => {
    const { apiFetch } = useApi()

    try {
      const response = await apiFetch<LoginResponse>('/login', {
        method: 'POST',
        body: credentials,
      })

      token.value = response.token
      user.value  = response.user

      return { success: true }
    } catch (error: any) {
      const message = extractErrorMessage(error)
      return { success: false, message }
    }
  }

  const logout = async (): Promise<void> => {
    const { apiFetch } = useApi()

    try {
      if (token.value) {
        await apiFetch('/logout', { method: 'POST' })
      }
    } catch {
      // Silencieux — on nettoie quoi qu'il arrive
    } finally {
      clearAuth()
      await navigateTo('/login')
    }
  }

  /**
   * Rafraîchit le profil + permissions depuis l'API.
   * Appelé au démarrage (plugin auth.client.ts) et après assignFunction / grant / revoke.
   */
  const refreshMe = async (): Promise<void> => {
    const { apiFetch } = useApi()

    try {
      const data = await apiFetch<AuthUser>('/user')
      user.value = data
    } catch {
      clearAuth()
      await navigateTo('/login')
    }
  }

  const clearAuth = (): void => {
    token.value = null
    user.value  = null
  }

  // ─────────────────────────────────────────────────────────────────────
  // Helpers internes
  // ─────────────────────────────────────────────────────────────────────

  const extractErrorMessage = (error: any): string => {
    if (error?.data?.errors) {
      const first = Object.values(error.data.errors)[0]
      if (Array.isArray(first) && first.length > 0) return first[0] as string
    }
    return error?.data?.message ?? 'Échec de la connexion'
  }

  return {
    token,
    user,
    isAuthenticated,
    currentUser,
    isAdmin,
    isManager,
    isAgent,
    can,
    canAll,
    login,
    logout,
    refreshMe,
    clearAuth,
  }
},
{
  persist: {
    key: 'vta-auth',
    storage: persistedState.localStorage,
    paths: ['token', 'user'],
  } as any,
})
