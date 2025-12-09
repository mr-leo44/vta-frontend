export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  
  // Attendre l'hydratation complète du store avant de rendre l'app
  if (authStore.$hydrate) {
    await authStore.$hydrate()
  }
})