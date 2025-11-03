export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()
  
  const isAuth = await authStore.checkAuth()
  
  if (!isAuth && to.path !== '/login') {
    return navigateTo('/login')
  }
  
  if (isAuth && to.path === '/login') {
    return navigateTo('/')
  }
})