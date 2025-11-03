export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()

  if (authStore.$hydrate) await authStore.$hydrate()
  const isAuth = await authStore.checkAuth()

  setTimeout(() => {
    if (!isAuth && to.path !== '/login') {
      return navigateTo('/login')
    }
  
    if (isAuth && to.path === '/login') {
      return navigateTo('/')
    }
  }, 50)
})