export default defineNuxtRouteMiddleware(async (to, from) => {
  // Côté serveur, on laisse passer
  if (process.server) {
    return
  }

  const authStore = useAuthStore()

  // Attendre l'hydratation du store
  if (authStore.$hydrate) {
    await authStore.$hydrate()
  }
  await nextTick()
  
  // Vérifier l'authentification
  const isAuth = authStore.isAuthenticated

  // Si non authentifié et que l'utilisateur essaie d'accéder à une page protégée
  if (!isAuth && to.path !== '/login') {
    const redirectPath = to.fullPath || '/'
    return navigateTo(`/login?redirect=${encodeURIComponent(redirectPath)}`)
  }

  // Si authentifié et que l'utilisateur essaie d'accéder à la page de login
  if (isAuth && to.path === '/login') {
    // Vérifier s'il y a un paramètre de redirection dans l'URL
    const redirect = to.query.redirect as string
    
    if (redirect && redirect !== '/login') {
      return navigateTo(redirect)
    }
    
    // Sinon rediriger vers la page d'accueil
    return navigateTo('/')
  }
})