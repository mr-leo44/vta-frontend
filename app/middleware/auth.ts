export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()
  
  // Initialize auth from localStorage
  if (import.meta.client && !authStore.token) {
    authStore.initAuth()
  }
  
  // Redirect to login if not authenticated
  if (!authStore.isAuthenticated && to.path !== '/login') {
    return navigateTo('/login')
  }
  
  // Redirect to home if authenticated and trying to access login
  if (authStore.isAuthenticated && to.path === '/login') {
    return navigateTo('/')
  }
})