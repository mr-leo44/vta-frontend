<template>
  <div class="space-y-6">

    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold">Mes permissions</h1>
      <p class="text-sm text-muted-foreground mt-1">
        Consultez vos permissions actuelles et demandez l'accès à de nouvelles fonctionnalités
      </p>
    </div>

    <!-- Current Role & Function Card -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card class="border-2">
        <CardHeader class="pb-3">
          <CardTitle class="text-sm text-muted-foreground">Votre rôle</CardTitle>
        </CardHeader>
        <CardContent>
          <div :class="roleClass(currentUser?.role)" class="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold">
            {{ roleLabel(currentUser?.role) }}
          </div>
          <p class="text-xs text-muted-foreground mt-2">Identifie votre niveau d'accès global</p>
        </CardContent>
      </Card>

      <Card class="border-2">
        <CardHeader class="pb-3">
          <CardTitle class="text-sm text-muted-foreground">Votre fonction</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="font-semibold text-base">
            {{ currentUser?.function ?? 'Non assignée' }}
          </div>
          <p class="text-xs text-muted-foreground mt-2">Rôle dans l'organisation</p>
        </CardContent>
      </Card>

      <Card class="border-2">
        <CardHeader class="pb-3">
          <CardTitle class="text-sm text-muted-foreground">Permissions actives</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="font-bold text-2xl text-blue-600 dark:text-blue-400">
            {{ currentPermissions.length }}
          </div>
          <p class="text-xs text-muted-foreground mt-2">Actions autorisées</p>
        </CardContent>
      </Card>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>

    <div v-else class="grid gap-6 lg:grid-cols-3">

      <!-- Main Permissions by Domain -->
      <div class="lg:col-span-2 space-y-4">
        <Card class="border-2">
          <CardHeader>
            <div class="flex items-center justify-between">
              <div>
                <CardTitle>Vos permissions actives</CardTitle>
                <CardDescription>Permissions du rôle - Grants + Revokes</CardDescription>
              </div>
              <Badge variant="secondary" class="text-xs font-mono">
                {{ currentPermissions.length }}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div v-if="currentPermissions.length === 0" class="text-center py-8 text-muted-foreground">
              <Lock class="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p class="text-sm">Aucune permission active actuellement</p>
            </div>
            <div v-else class="space-y-4">
              <div v-for="(perms, domain) in groupedCurrentPermissions" :key="domain">
                <h4 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  {{ domain }}
                </h4>
                <div class="flex flex-wrap gap-2">
                  <Badge v-for="perm in perms" :key="perm" variant="default" class="font-mono text-xs">
                    {{ perm.split('.')[1] }}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Requested Permissions -->
        <Card v-if="pendingRequests.length > 0" class="border-2 border-amber-200 dark:border-amber-800">
          <CardHeader>
            <div class="flex items-center gap-2">
              <AlertCircle class="h-4 w-4 text-amber-600" />
              <CardTitle class="text-base">Demandes en attente</CardTitle>
            </div>
            <CardDescription>En cours de révision par un administrateur</CardDescription>
          </CardHeader>
          <CardContent class="space-y-2">
            <div v-for="req in pendingRequests" :key="req.id" class="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <div>
                <p class="font-mono text-sm font-semibold">{{ req.permission }}</p>
                <p class="text-xs text-muted-foreground mt-1">{{ req.reason || 'Pas de justification' }}</p>
              </div>
              <Badge variant="outline" class="text-amber-700 border-amber-300 dark:text-amber-400 dark:border-amber-700">
                En attente
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Request New Permission -->
      <div class="space-y-4">
        <Card class="border-2 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle class="text-base flex items-center gap-2">
              <Plus class="h-4 w-4 text-blue-600" />
              Demander une permission
            </CardTitle>
            <CardDescription class="text-xs">Requête pour administrateur</CardDescription>
          </CardHeader>
          <CardContent class="space-y-3">
            <div class="space-y-1.5">
              <Label class="text-xs font-semibold">Permission</Label>
              <Select v-model="requestForm.permission">
                <SelectTrigger class="h-8 text-xs">
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent class="max-h-48">
                  <SelectGroup v-for="(perms, domain) in availablePermissions" :key="domain">
                    <SelectLabel class="text-xs font-semibold">{{ domain }}</SelectLabel>
                    <SelectItem v-for="perm in perms" :key="perm" :value="perm" class="font-mono text-xs">
                      {{ perm }}
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div v-if="requestForm.permission" class="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300">
              <p v-if="getPermissionDesc(requestForm.permission)" class="text-xs">
                {{ getPermissionDesc(requestForm.permission) }}
              </p>
            </div>

            <div class="space-y-1.5">
              <Label class="text-xs font-semibold">Justification</Label>
              <textarea
                v-model="requestForm.reason"
                placeholder="Pourquoi avez-vous besoin de cette permission?"
                class="w-full px-2 py-1.5 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none h-20"
              />
            </div>

            <Button
              size="sm"
              class="w-full"
              :disabled="!requestForm.permission || !requestForm.reason.trim() || submitting"
              @click="submitRequest"
            >
              <span v-if="submitting" class="flex items-center gap-2">
                <div class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Envoi...
              </span>
              <span v-else class="flex items-center gap-2">
                <Send class="h-3.5 w-3.5" />
                Demander
              </span>
            </Button>

            <p class="text-[10px] text-muted-foreground text-center">
              Votre demande sera examinée par un administrateur
            </p>
          </CardContent>
        </Card>

        <!-- Available Permissions Preview -->
        <Card class="border-2 bg-muted/30">
          <CardHeader>
            <CardTitle class="text-sm">Toutes les permissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-2.5 max-h-[400px] overflow-y-auto">
              <div v-for="(perms, domain) in allAvailablePermissions" :key="domain" class="text-xs">
                <p class="font-semibold text-muted-foreground mb-1.5">{{ domain }}</p>
                <div class="space-y-1">
                  <div v-for="perm in perms" :key="perm" class="flex items-center gap-2">
                    <div
                      :class="
                        currentPermissions.includes(perm)
                          ? 'bg-green-500'
                          : pendingPermissions.includes(perm)
                            ? 'bg-amber-500'
                            : 'bg-gray-300'
                      "
                      class="h-1.5 w-1.5 rounded-full"
                    />
                    <code class="text-[10px] font-mono text-muted-foreground">{{ perm.split('.')[1] }}</code>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Legend -->
        <div class="text-xs text-muted-foreground space-y-2 p-3 rounded-lg border bg-muted/40">
          <div class="font-semibold mb-2">Légende</div>
          <div class="flex items-center gap-2">
            <div class="h-2 w-2 rounded-full bg-green-500" />
            Active
          </div>
          <div class="flex items-center gap-2">
            <div class="h-2 w-2 rounded-full bg-amber-500" />
            En demande
          </div>
          <div class="flex items-center gap-2">
            <div class="h-2 w-2 rounded-full bg-gray-300" />
            Disponible
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus, AlertCircle, Lock, Send } from 'lucide-vue-next'
import { ref, computed, onMounted } from 'vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import type { AuthUser } from '~/types/api'
import { useToast } from '@/composables/useToast'

definePageMeta({ middleware: 'auth' })

const { apiFetch } = useApi()
const { success: showSuccess, error: showError } = useToast()
const authStore = useAuthStore()

// Toutes les permissions disponibles (hardcodé comme référence)
const ALL_PERMISSIONS = [
  // Flight
  'flight.viewAny', 'flight.view', 'flight.create', 'flight.updateOwn', 'flight.updateAny',
  'flight.deleteOwn', 'flight.deleteAny', 'flight.validate', 'flight.export',
  // Aircraft
  'aircraft.viewAny', 'aircraft.view', 'aircraft.create', 'aircraft.update', 'aircraft.delete',
  // Aircraft Type
  'aircraftType.viewAny', 'aircraftType.view', 'aircraftType.create', 'aircraftType.update', 'aircraftType.delete',
  // Operator
  'operator.viewAny', 'operator.view', 'operator.create', 'operator.update', 'operator.delete',
  // Report
  'report.view', 'report.export',
  // User
  'user.viewAny', 'user.create', 'user.update', 'user.delete', 'user.assignFunction',
  // Permission Request
  'permissionRequest.create', 'permissionRequest.manage',
  // Files
  'files.import',
]

// Descriptions de permissions
const PERMISSION_DESCRIPTIONS: Record<string, string> = {
  'flight.create': 'Créer des vols',
  'flight.updateOwn': 'Modifier ses propres vols',
  'flight.updateAny': 'Modifier tous les vols',
  'flight.deleteOwn': 'Supprimer ses propres vols',
  'flight.deleteAny': 'Supprimer tous les vols',
  'flight.validate': 'Valider les vols',
  'flight.export': 'Exporter les vols',
  'aircraft.create': 'Créer des aéronefs',
  'aircraft.update': 'Modifier des aéronefs',
  'aircraft.delete': 'Supprimer des aéronefs',
  'aircraftType.create': 'Créer des types d\'aéronef',
  'aircraftType.update': 'Modifier des types d\'aéronef',
  'aircraftType.delete': 'Supprimer des types d\'aéronef',
  'operator.create': 'Créer des exploitants',
  'operator.update': 'Modifier des exploitants',
  'operator.delete': 'Supprimer des exploitants',
  'report.view': 'Consulter les rapports',
  'report.export': 'Exporter les rapports',
  'user.create': 'Créer des agents',
  'user.update': 'Modifier des agents',
  'user.delete': 'Supprimer des agents',
  'user.assignFunction': 'Assigner des fonctions',
  'files.import': 'Importer des fichiers',
}

const loading = ref(true)
const submitting = ref(false)
const currentUser = ref<AuthUser | null>(null)
const currentPermissions = ref<string[]>([])
const pendingRequests = ref<any[]>([])

const requestForm = ref({
  permission: '',
  reason: '',
})

// ─────────────────────────────────────────────────────────────────────
// Computed
// ─────────────────────────────────────────────────────────────────────

const roleLabel = (role?: string | null) => ({
  admin: 'Administrateur',
  manager: 'Manager',
  permanent: 'Permanent',
  agent: 'Agent',
}[role ?? ''] ?? '—')

const roleClass = (role?: string | null) => ({
  admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  permanent: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  agent: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
}[role ?? ''] ?? 'bg-gray-100 text-gray-600')

const getPermissionDesc = (perm: string) => PERMISSION_DESCRIPTIONS[perm] || ''

const groupedCurrentPermissions = computed(() => {
  const groups: Record<string, string[]> = {}
  for (const perm of currentPermissions.value) {
    const domain = perm.split('.')[0]
    if (!groups[domain]) groups[domain] = []
    groups[domain].push(perm)
  }
  return groups
})

const pendingPermissions = computed(() =>
  pendingRequests.value.map(r => r.permission)
)

const availablePermissions = computed(() => {
  const groups: Record<string, string[]> = {}
  for (const perm of ALL_PERMISSIONS) {
    if (currentPermissions.value.includes(perm) || pendingPermissions.value.includes(perm)) continue
    const domain = perm.split('.')[0]
    if (!groups[domain]) groups[domain] = []
    groups[domain].push(perm)
  }
  return groups
})

const allAvailablePermissions = computed(() => {
  const groups: Record<string, string[]> = {}
  for (const perm of ALL_PERMISSIONS) {
    const domain = perm.split('.')[0]
    if (!groups[domain]) groups[domain] = []
    groups[domain].push(perm)
  }
  return groups
})

// ─────────────────────────────────────────────────────────────────────
// API
// ─────────────────────────────────────────────────────────────────────

const fetchData = async () => {
  loading.value = true
  try {
    currentUser.value = authStore.user as AuthUser
    
    // Récupérer les permissions actuelles
    // const permsRes = await apiFetch<{ permissions: string[] }>(`users/${currentUser.value.id}/permissions/`)
    const permsRes = authStore.user?.permissions
    currentPermissions.value = permsRes || []

    // Récupérer les demandes en attente
    // const requestsRes = await apiFetch<any>('/permission-requests/my-pending')
    pendingRequests.value = 
    // requestsRes.data || 
    []
  } catch (err) {
    showError('Erreur lors du chargement des données')
  } finally {
    loading.value = false
  }
}

const submitRequest = async () => {
  if (!requestForm.value.permission) return

  submitting.value = true
  try {
    await apiFetch('/permission-requests', {
      method: 'POST',
      body: {
        permission: requestForm.value.permission,
        reason: requestForm.value.reason,
      },
    })

    showSuccess('Demande envoyée', 'Votre demande de permission a été transmise à un administrateur')
    requestForm.value = { permission: '', reason: '' }
    await fetchData()
  } catch (err: any) {
    showError(err?.data?.message ?? 'Erreur lors de l\'envoi de la demande')
  } finally {
    submitting.value = false
  }
}

// ─────────────────────────────────────────────────────────────────────
// Lifecycle
// ─────────────────────────────────────────────────────────────────────

onMounted(() => fetchData())
</script>
