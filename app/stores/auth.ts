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
  const isPermanent     = computed(() => user.value?.role === 'permanent')
  const isAgent         = computed(() => user.value?.role === 'agent')

  /**
   * Vérifie une ou plusieurs permissions (AU MOINS UNE).
   *
   * Retourne une fonction — Vue détecte la dépendance sur user.value
   * et réévalue les composants dès que les permissions changent
   * (ex: après grant/revoke ou changement de fonction).
   *
   * Usage :
   *   auth.can.value('flight.create')
   *   auth.can.value(['flight.updateOwn', 'flight.updateAny'])
   */
  const can = computed(() => (permission: string | string[]): boolean => {
    if (!user.value?.permissions) return false
    const perms = Array.isArray(permission) ? permission : [permission]
    return perms.some(p => user.value!.permissions.includes(p))
  })

  /**
   * Vérifie que TOUTES les permissions listées sont présentes.
   */
  const canAll = computed(() => (permissions: string[]): boolean => {
    if (!user.value?.permissions) return false
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
      return { success: false, message: extractErrorMessage(error) }
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
   * Rafraîchit le profil + permissions depuis GET /user.
   *
   * Appelé automatiquement :
   * - Au démarrage de l'app (plugin auth.client.ts)
   * - Après assignation d'une fonction (UserController::assignFunction)
   * - Après grant / revoke de permission (UserPermissionController)
   *
   * ⚠️  Ceci est le seul endroit où user.value est réécrit post-login.
   *     Tout changement de permissions doit passer ici pour garantir
   *     la réactivité du can() computed dans tous les composants.
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

  /**
   * Rafraîchit silencieusement (sans redirection si erreur).
   * Utile après une action admin sur un autre user — l'admin
   * n'a pas besoin d'être déconnecté si le refresh échoue.
   */
  const refreshMeSilent = async (): Promise<boolean> => {
    const { apiFetch } = useApi()

    try {
      const data = await apiFetch<AuthUser>('/user')
      user.value = data
      return true
    } catch {
      return false
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
    isPermanent,
    isAgent,
    can,
    canAll,
    login,
    logout,
    refreshMe,
    refreshMeSilent,
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