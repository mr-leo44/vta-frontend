import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ApiResponse, PaginatedResponse } from '~/types/api'

const handleApiError = (error: any): string => {
  console.error('API Error:', error)
  
  if (error?.data?.message) {
    return error.data.message
  }
  
  if (error?.data?.errors) {
    const firstError = Object.values(error.data.errors)[0]
    if (Array.isArray(firstError) && firstError.length > 0) {
      return firstError[0] as string
    }
  }
  
  return 'Une erreur est survenue'
}

export const useUsersStore = defineStore('users', () => {
  // Liste paginée (pour les pages avec pagination)
  const users = ref([])
  
  // Liste complète (pour les selects, autocomplete, etc.)
  const allUsers = ref([])
  
  const loading = ref(false)
  const loadingAll = ref(false)
  const error = ref<string | null>(null)
  
  // Pagination
  const currentPage = ref(1)
  const lastPage = ref(1)
  const perPage = ref(10)
  const total = ref(0)
  const hasMorePages = computed(() => currentPage.value < lastPage.value)

  const usersList = computed(() => users.value)
  const allUsersList = computed(() => allUsers.value)

  /**
   * Récupère TOUS les utilisateurs (sans pagination)
   * Utilise GET /users/all
   * Utile pour: selects, autocomplete, dropdowns
   */
  const fetchAllUsers = async () => {
    loadingAll.value = true
    error.value = null
    const { apiFetch } = useApi()
    
    try {
      const response = await apiFetch<ApiResponse<any>>('/users/all')
      allUsers.value = response.data
      
      return { success: true, data: response.data }
    } catch (err: any) {
      error.value = handleApiError(err)
      return { success: false, message: error.value }
    } finally {
      loadingAll.value = false
    }
  }

  /**
   * Récupère les utilisateurs avec pagination
   * Utilise GET /users?page=X
   */
  const fetchusers = async (page: number = 1, append: boolean = false) => {
    loading.value = true
    error.value = null
    const { apiFetch } = useApi()
    
    try {
      const response = await apiFetch<PaginatedResponse<any>>(`/users?page=${page}`)
      
      if (append) {
        users.value = [...users.value, ...response.data]
      } else {
        users.value = response.data
      }
      
      currentPage.value = response.meta.current_page
      lastPage.value = response.meta.last_page
      perPage.value = response.meta.per_page
      total.value = response.meta.total

      return { success: true, data: response.data }
    } catch (err: any) {
      error.value = handleApiError(err)
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Charge la page suivante (infinite scroll)
   */
  const loadNextPage = async () => {
    if (!hasMorePages.value || loading.value) return
    
    await fetchusers(currentPage.value + 1, true)
  }

  /**
   * Crée un nouvel utilisateur
   */
  // const createuser = async (data: userFormData) => {
  //   loading.value = true
  //   error.value = null
  //   const { apiFetch } = useApi()
    
  //   try {
  //     const response = await apiFetch<ApiResponse<user>>('/users', {
  //       method: 'POST',
  //       body: data
  //     })
      
  //     // Ajoute aux deux listes
  //     users.value.unshift(response.data)
  //     allUsers.value.unshift(response.data)
  //     total.value += 1
      
  //     return { success: true, data: response.data }
  //   } catch (err: any) {
  //     error.value = handleApiError(err)
  //     return { 
  //       success: false, 
  //       message: error.value, 
  //       errors: err?.data?.errors 
  //     }
  //   } finally {
  //     loading.value = false
  //   }
  // }

  /**
   * Met à jour un utilisateur
   */
  // const updateuser = async (id: number, data: Partial<userFormData>) => {
  //   loading.value = true
  //   error.value = null
  //   const { apiFetch } = useApi()
    
  //   try {
  //     const response = await apiFetch<ApiResponse<user>>(`/users/${id}`, {
  //       method: 'PUT',
  //       body: data
  //     })
      
  //     // Met à jour dans la liste paginée
  //     const index = users.value.findIndex(a => a.id === id)
  //     if (index !== -1) {
  //       users.value[index] = response.data
  //     }
      
  //     // Met à jour dans la liste complète
  //     const allIndex = allUsers.value.findIndex(a => a.id === id)
  //     if (allIndex !== -1) {
  //       allUsers.value[allIndex] = response.data
  //     }
      
  //     if (currentuser.value?.id === id) {
  //       currentuser.value = response.data
  //     }
      
  //     return { success: true, data: response.data }
  //   } catch (err: any) {
  //     error.value = handleApiError(err)
  //     return { 
  //       success: false, 
  //       message: error.value, 
  //       errors: err?.data?.errors 
  //     }
  //   } finally {
  //     loading.value = false
  //   }
  // }

  /**
   * Supprime un utilisateur
   */
  // const deleteuser = async (id: number) => {
  //   loading.value = true
  //   error.value = null
  //   const { apiFetch } = useApi()
    
  //   try {
  //     await apiFetch(`/users/${id}`, { method: 'DELETE' })
      
  //     // Supprime des deux listes
  //     users.value = users.value.filter(a => a.id !== id)
  //     allUsers.value = allUsers.value.filter(a => a.id !== id)
  //     total.value -= 1
      
  //     if (currentuser.value?.id === id) {
  //       currentuser.value = null
  //     }
      
  //     return { success: true }
  //   } catch (err: any) {
  //     error.value = handleApiError(err)
  //     return { success: false, message: error.value }
  //   } finally {
  //     loading.value = false
  //   }
  // }

  const clearError = () => {
    error.value = null
  }

  // const clearCurrentuser = () => {
  //   currentuser.value = null
  // }

  const resetPagination = () => {
    users.value = []
    currentPage.value = 1
    lastPage.value = 1
    total.value = 0
  }

  const clearAll = () => {
    allUsers.value = []
  }

  return {
    // States
    users,
    allUsers,
    loading,
    loadingAll,
    error,
    currentPage,
    lastPage,
    perPage,
    total,
    hasMorePages,
    
    // Computed
    usersList,
    allUsersList,
    
    // Actions
    fetchAllUsers,      // Nouveau: charge tout
    fetchusers,
    loadNextPage,
    // fetchuser,
    // searchusers,
    // fetchuserKPIs,
    // createuser,
    // updateuser,
    // deleteuser,
    clearError,
    // clearCurrentuser,
    resetPagination,
    clearAll                // Nouveau: nettoie allUsers
  }
})