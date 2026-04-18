export default defineNuxtRouteMiddleware(async (to) => {
  if (process.server) return

  const auth = useAuthStore()

  if (auth.$hydrate) {
    await auth.$hydrate()
  }
  await nextTick()

  const isAuth = auth.isAuthenticated

  if (!isAuth && to.path !== '/login') {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath || '/')}`)
  }

  if (isAuth && to.path === '/login') {
    const redirect = to.query.redirect as string
    return navigateTo(redirect && redirect !== '/login' ? redirect : '/')
  }
})
