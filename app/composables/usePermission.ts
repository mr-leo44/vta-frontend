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
 *
 * ─── Matrice de visibilité nav ──────────────────────────────────────
 *
 *  Rubrique         │ admin │ manager │ agent │ permanent
 * ──────────────────┼───────┼─────────┼───────┼──────────
 *  Tableau de bord  │  ✓    │   ✓     │  ✓    │   ✓
 *  Vols             │  ✓    │   ✓     │  ✓    │   ✓
 *  Exploitants      │  ✓    │   ✓     │  ✓    │   ✗
 *  Aéronefs         │  ✓    │   ✓     │  ✓    │   ✗
 *  Types aéronef    │  ✓    │   ✓     │  ✓    │   ✗
 *  Rapports         │  ✓    │   ✓     │  ✗    │   ✗
 *  Agents           │  ✓    │   ✗     │  ✗    │   ✗
 *  Imports          │  ✓    │   ✗     │  ✗    │   ✗
 *  Permissions      │  ✓    │   ✓     │  ✓    │   ✓  (toujours)
 *  Logs d'audit     │  ✓    │   ✗     │  ✗    │   ✗
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
  const canViewFlights     = computed(() => auth.can('flight.view'))
  const canCreateFlight    = computed(() => auth.can('flight.create'))
  const canUpdateFlight    = computed(() => auth.can(['flight.updateOwn', 'flight.updateAny']))
  const canUpdateAnyFlight = computed(() => auth.can('flight.updateAny'))
  const canDeleteFlight    = computed(() => auth.can(['flight.deleteOwn', 'flight.deleteAny']))
  const canValidateFlight  = computed(() => auth.can('flight.validate'))
  const canExportFlight    = computed(() => auth.can('flight.export'))

  // ── Avions ────────────────────────────────────────────────────────────────
  const canViewAircrafts   = computed(() => auth.can('aircraft.view'))
  const canCreateAircraft  = computed(() => auth.can('aircraft.create'))
  const canUpdateAircraft  = computed(() => auth.can('aircraft.update'))
  const canDeleteAircraft  = computed(() => auth.can('aircraft.delete'))
  const canManageAircrafts = computed(() =>
    auth.can(['aircraft.create', 'aircraft.update', 'aircraft.delete'])
  )

  // ── Types d'avion ─────────────────────────────────────────────────────────
  const canViewAircraftTypes   = computed(() => auth.can('aircraftType.view'))
  const canCreateAircraftType  = computed(() => auth.can('aircraftType.create'))
  const canUpdateAircraftType  = computed(() => auth.can('aircraftType.update'))
  const canDeleteAircraftType  = computed(() => auth.can('aircraftType.delete'))
  const canManageAircraftTypes = computed(() =>
    auth.can(['aircraftType.create', 'aircraftType.update', 'aircraftType.delete'])
  )

  // ── Opérateurs ────────────────────────────────────────────────────────────
  const canViewOperators   = computed(() => auth.can('operator.view'))
  const canCreateOperator  = computed(() => auth.can('operator.create'))
  const canUpdateOperator  = computed(() => auth.can('operator.update'))
  const canDeleteOperator  = computed(() => auth.can('operator.delete'))
  const canManageOperators = computed(() =>
    auth.can(['operator.create', 'operator.update', 'operator.delete'])
  )

  // ── Utilisateurs / Agents ─────────────────────────────────────────────────
  const canViewUsers      = computed(() => auth.can('user.view'))
  const canCreateUser     = computed(() => auth.can('user.create'))
  const canUpdateUser     = computed(() => auth.can('user.update'))
  const canDeleteUser     = computed(() => auth.can('user.delete'))
  const canAssignFunction = computed(() => auth.can('user.assignFunction'))
  const canManageUsers    = computed(() => auth.can('user.view'))

  // ── Rapports ──────────────────────────────────────────────────────────────
  const canViewReports   = computed(() => auth.can('report.view'))
  const canExportReports = computed(() => auth.can('report.export'))

  // ── Permissions / Imports ─────────────────────────────────────────────────
  const canManagePermissions = computed(() => auth.can('permissionRequest.manage'))
  const canRequestPermission = computed(() => auth.can('permissionRequest.create'))
  const canImport            = computed(() => auth.can('files.import'))

  // ─── Navigation ────────────────────────────────────────────────────────────
  /**
   * Visibilité des items de navigation par rôle.
   *
   * Les valeurs reposent sur les permissions effectives calculées côté backend
   * (rôle + overrides grant/revoke). La matrice ci-dessous est documentée
   * en en-tête du fichier.
   *
   * Règles explicites par rôle :
   *   admin     → tout
   *   manager   → vols + exploitants + aéronefs + rapports + permissions
   *              (pas agents, pas imports, pas logs)
   *   agent     → vols + exploitants + aéronefs + permissions
   *              (pas rapports, pas agents, pas imports, pas logs)
   *   permanent → vols + permissions seulement
   *              (pas exploitants, pas aéronefs, pas rapports, pas admin)
   *
   * `permissions` est TOUJOURS true : tout utilisateur authentifié peut
   * consulter ses propres permissions et soumettre une demande.
   */
  const nav = computed(() => {
    const role = auth.user?.role

    return {
      // ── Vols : tous les rôles ─────────────────────────────────────────────
      flights: auth.can('flight.view'),

      // ── Exploitants : admin / manager / agent — pas permanent ─────────────
      operators: role !== 'permanent' && auth.can('operator.view'),

      // ── Aéronefs : admin / manager / agent — pas permanent ────────────────
      aircrafts: role !== 'permanent' && auth.can('aircraft.view'),

      // ── Types aéronef : admin / manager / agent — pas permanent ───────────
      aircraftTypes: role !== 'permanent' && auth.can('aircraftType.view'),

      // ── Rapports : admin / manager — pas agent, pas permanent ─────────────
      reports: (role === 'admin' || role === 'manager') && auth.can('report.view'),

      // ── Agents (gestion users) : admin uniquement ─────────────────────────
      agents: role === 'admin' && auth.can('user.create'),

      // ── Imports : admin uniquement ────────────────────────────────────────
      imports: role === 'admin' && auth.can('files.import'),

      // ── Permissions : toujours visible ────────────────────────────────────
      permissions: true,

      // ── Logs d'audit : admin uniquement ───────────────────────────────────
      logs: role === 'admin' && auth.isAdmin,
    }
  })

  return {
    /** Vrai si l'utilisateur a AU MOINS UNE des permissions listées. */
    can: (permission: string | string[]) => auth.can(permission),

    /** Vrai si l'utilisateur a TOUTES les permissions listées. */
    canAll: (permissions: string[]) => auth.canAll(permissions),

    // Infos utilisateur
    role,
    userFunction,
    userName,

    // Rôles
    isAdmin,
    isManager,
    isPermanent,
    isAgent,
    isSupervisor,

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