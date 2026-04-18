import { useToast } from '~/composables/useToast'


/**
 * Middleware permission — vérifie que l'utilisateur a la permission requise
 * déclarée dans definePageMeta({ permission: '...' }).
 *
 * En cas d'accès refusé : toast d'erreur + redirection vers '/'
 * (pas de page 403 — UX plus fluide)
 */
export default defineNuxtRouteMiddleware((to) => {
  const auth    = useAuthStore()
const { warning: showWarning } = useToast()

  const required = to.meta.permission as string | string[] | undefined
  if (!required) return

  const hasAccess = Array.isArray(required)
    ? required.some(p => auth.can(p))
    : auth.can(required)

  if (!hasAccess) {
    showWarning('Accès refusé',"Vous n'avez pas les permissions nécessaires pour accéder à cette page.")
    return navigateTo('/')
  }
})