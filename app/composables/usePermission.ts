/**
 * usePermission — composable pour la gestion des accès dans les composants Vue.
 *
 * Usage dans un template :
 *   const { can, canAll, isAdmin } = usePermission()
 *
 *   v-if="can('flight.create')"
 *   v-if="can(['flight.updateOwn', 'flight.updateAny'])"
 *   v-if="canAll(['operator.create', 'operator.update'])"
 *
 * Les permissions viennent exclusivement du store Pinia — le backend
 * calcule les permissions effectives (rôle + overrides grant/revoke)
 * et les renvoie via GET /user. Le front ne recalcule rien.
 *
 * ⚠️  Après tout changement de fonction ou d'override, appeler
 *     authStore.refreshMe() ou refreshMeSilent() pour re-hydrater
 *     le store et déclencher la réactivité de tous les can().
 */
export function usePermission() {
  const auth = useAuthStore()

  // ─── Vérifications génériques ──────────────────────────────────────────────

  /** Vrai si l'utilisateur a AU MOINS UNE des permissions listées. */
  const can = (permission: string | string[]): boolean =>
    auth.can(permission)

  /** Vrai si l'utilisateur a TOUTES les permissions listées. */
  const canAll = (permissions: string[]): boolean =>
    auth.canAll(permissions)

  // ─── Rôles ─────────────────────────────────────────────────────────────────

  const isAdmin     = computed(() => auth.isAdmin)
  const isManager   = computed(() => auth.isManager)
  const isPermanent = computed(() => auth.isPermanent)
  const isAgent     = computed(() => auth.isAgent)

  /** Admin ou Manager — peut accéder aux sections de supervision. */
  const isSupervisor = computed(() => auth.isAdmin || auth.isManager)

  // ─── Infos utilisateur ─────────────────────────────────────────────────────

  const role         = computed(() => auth.user?.role ?? null)
  const userFunction = computed(() => auth.user?.function ?? null)
  const userName     = computed(() => auth.user?.name ?? null)

  // ─────────────────────────────────────────────────────────────────────────
  // Helpers métier — computed réactifs
  // ─────────────────────────────────────────────────────────────────────────

  // ── Vols ──────────────────────────────────────────────────────────────────
  const canViewFlights     = computed(() => auth.can('flight.viewAny'))
  const canCreateFlight    = computed(() => auth.can('flight.create'))
  const canUpdateFlight    = computed(() => auth.can(['flight.updateOwn', 'flight.updateAny']))
  const canUpdateAnyFlight = computed(() => auth.can('flight.updateAny'))
  const canDeleteFlight    = computed(() => auth.can(['flight.deleteOwn', 'flight.deleteAny']))
  const canValidateFlight  = computed(() => auth.can('flight.validate'))
  const canExportFlight    = computed(() => auth.can('flight.export'))

  // ── Avions ────────────────────────────────────────────────────────────────
  const canViewAircrafts   = computed(() => auth.can('aircraft.viewAny'))
  const canCreateAircraft  = computed(() => auth.can('aircraft.create'))
  const canUpdateAircraft  = computed(() => auth.can('aircraft.update'))
  const canDeleteAircraft  = computed(() => auth.can('aircraft.delete'))
  const canManageAircrafts = computed(() =>
    auth.can(['aircraft.create', 'aircraft.update', 'aircraft.delete'])
  )

  // ── Types d'avion ─────────────────────────────────────────────────────────
  const canViewAircraftTypes   = computed(() => auth.can('aircraftType.viewAny'))
  const canCreateAircraftType  = computed(() => auth.can('aircraftType.create'))
  const canUpdateAircraftType  = computed(() => auth.can('aircraftType.update'))
  const canDeleteAircraftType  = computed(() => auth.can('aircraftType.delete'))
  const canManageAircraftTypes = computed(() =>
    auth.can(['aircraftType.create', 'aircraftType.update', 'aircraftType.delete'])
  )

  // ── Opérateurs ────────────────────────────────────────────────────────────
  const canViewOperators   = computed(() => auth.can('operator.viewAny'))
  const canCreateOperator  = computed(() => auth.can('operator.create'))
  const canUpdateOperator  = computed(() => auth.can('operator.update'))
  const canDeleteOperator  = computed(() => auth.can('operator.delete'))
  const canManageOperators = computed(() =>
    auth.can(['operator.create', 'operator.update', 'operator.delete'])
  )

  // ── Utilisateurs / Agents ─────────────────────────────────────────────────
  const canViewUsers      = computed(() => auth.can('user.viewAny'))
  const canCreateUser     = computed(() => auth.can('user.create'))
  const canUpdateUser     = computed(() => auth.can('user.update'))
  const canDeleteUser     = computed(() => auth.can('user.delete'))
  const canAssignFunction = computed(() => auth.can('user.assignFunction'))
  const canManageUsers    = computed(() => auth.can('user.viewAny'))

  // ── Rapports ──────────────────────────────────────────────────────────────
  const canViewReports   = computed(() => auth.can('report.view'))
  const canExportReports = computed(() => auth.can('report.export'))

  // ── Permissions / Imports ─────────────────────────────────────────────────
  const canManagePermissions = computed(() => auth.can('permissionRequest.manage'))
  const canRequestPermission = computed(() => auth.can('permissionRequest.create'))
  const canImport            = computed(() => auth.can('files.import'))

  // ─── Navigation ────────────────────────────────────────────────────────────
  /**
   * Visibilité des items de nav.
   *
   * `permissions` est TOUJOURS true : chaque utilisateur authentifié peut
   * consulter ses propres permissions et soumettre une demande via
   * permissionRequest.create. La page /permissions affiche ensuite
   * les actions supplémentaires selon le rôle (gestion admin vs vue user).
   */
  const nav = computed(() => ({
    flights:       auth.can('flight.viewAny'),
    operators:     auth.can('operator.viewAny'),
    aircrafts:     auth.can('aircraft.viewAny'),
    aircraftTypes: auth.can('aircraftType.viewAny'),
    agents:        auth.can('user.viewAny'),
    reports:       auth.can('report.view'),
    imports:       auth.can('files.import'),
    permissions:   true, // Visible pour tout utilisateur authentifié
  }))

  return {
    /** Vrai si l'utilisateur a AU MOINS UNE des permissions listées. */
    can: (permission: string | string[]) => auth.can(permission),

    /** Vrai si l'utilisateur a TOUTES les permissions listées. */
    canAll: (permissions: string[]) => auth.canAll(permissions),

    // Infos utilisateur
    role,
    userFunction,
    userName,

    // Navigation
    nav,

    // Vols
    canViewFlights,
    canCreateFlight,
    canUpdateFlight,
    canUpdateAnyFlight,
    canDeleteFlight,
    canValidateFlight,
    canExportFlight,

    // Avions
    canViewAircrafts,
    canCreateAircraft,
    canUpdateAircraft,
    canDeleteAircraft,
    canManageAircrafts,

    // Types d'avion
    canViewAircraftTypes,
    canCreateAircraftType,
    canUpdateAircraftType,
    canDeleteAircraftType,
    canManageAircraftTypes,

    // Opérateurs
    canViewOperators,
    canCreateOperator,
    canUpdateOperator,
    canDeleteOperator,
    canManageOperators,

    // Utilisateurs
    canViewUsers,
    canCreateUser,
    canUpdateUser,
    canDeleteUser,
    canAssignFunction,
    canManageUsers,

    // Rapports
    canViewReports,
    canExportReports,

    // Permissions / Imports
    canManagePermissions,
    canRequestPermission,
    canImport,
  }
}