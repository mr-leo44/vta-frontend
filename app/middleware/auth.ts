export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore()

  await authStore.$hydrate()

  await nextTick()
  const isAuth = await authStore.checkAuth()
  setTimeout(() => {
    if (!isAuth && to.path !== '/login') {
      // Sauvegarde la route demandée pour redirection après login
      const redirectPath = to.fullPath || '/'
      return navigateTo(`/login?redirect=${encodeURIComponent(redirectPath)}`)
    }

    // Si l'utilisateur est connecté et tente d'aller sur /login
    if (isAuth && to.path === '/login') {
      // Redirige vers la page d'origine ou vers la racine si aucun "from"
      const redirectPath = from.fullPath && from.fullPath !== '/login' ? from.fullPath : '/'
      return navigateTo(redirectPath)
    }
  }, 500)
})