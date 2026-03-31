/**
 * usePermission — composable pour la gestion des accès dans les composants Vue.
 *
 * Usage dans un template :
 *   const { can, isAdmin } = usePermission()
 *   v-if="can('flight.create')"
 *   v-if="can(['flight.updateOwn', 'flight.updateAny'])"
 *   v-if="canAll(['operator.create', 'operator.update'])"
 *
 * Les permissions viennent du store Pinia (effectivePermissions du backend).
 * Le front ne recalcule rien — il affiche selon ce que l'API a retourné.
 */
export function usePermission() {
  const auth = useAuthStore()

  return {
    /** Vrai si l'utilisateur a AU MOINS UNE des permissions listées. */
    can: (permission: string | string[]) => auth.can(permission),

    /** Vrai si l'utilisateur a TOUTES les permissions listées. */
    canAll: (permissions: string[]) => auth.canAll(permissions),

    isAdmin:   computed(() => auth.isAdmin),
    isManager: computed(() => auth.isManager),
    isAgent:   computed(() => auth.isAgent),

    role:         computed(() => auth.user?.role ?? null),
    userFunction: computed(() => auth.user?.function ?? null),
    userName:     computed(() => auth.user?.name ?? null),
  }
}
