<template>
  <div class="space-y-6">

    <!-- Header -->
    <div class="flex items-center gap-4">
      <Button variant="ghost" size="sm" @click="navigateTo('/agents/')">
        <ArrowLeft class="h-4 w-4 mr-1" />
        Retour
      </Button>
      <div>
        <h1 class="text-2xl font-bold">Permissions — {{ detail?.user.name }}</h1>
        <p class="text-sm text-muted-foreground mt-0.5">
          Fonction : <span class="font-medium">{{ detail?.user.function ?? '—' }}</span>
          &nbsp;·&nbsp;
          Rôle : <span :class="roleClass(detail?.user.role)" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium">
            {{ roleLabel(detail?.user.role) }}
          </span>
        </p>
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>

    <div v-else-if="detail" class="grid gap-6 lg:grid-cols-3">

      <!-- Colonne gauche : permissions effectives -->
      <div class="lg:col-span-2 space-y-4">
        <Card class="border-2">
          <CardHeader>
            <div class="flex items-center justify-between">
              <CardTitle class="text-base">Permissions effectives</CardTitle>
              <span class="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                {{ detail.effective_permissions.length }} actives
              </span>
            </div>
            <CardDescription>Résultat final : rôle + grants − revokes</CardDescription>
          </CardHeader>
          <CardContent>
            <!-- Groupé par domaine -->
            <div v-for="(perms, domain) in groupedPermissions" :key="domain" class="mb-4">
              <h4 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                {{ domain }}
              </h4>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="perm in perms"
                  :key="perm.name"
                  :class="[
                    'inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono border',
                    perm.isGrant  ? 'border-green-400 bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700' :
                    perm.isRevoke ? 'border-red-400 bg-red-50 text-red-700 line-through opacity-60 dark:bg-red-900/20 dark:text-red-300' :
                                    'border-border bg-secondary text-secondary-foreground'
                  ]"
                >
                  <Plus v-if="perm.isGrant"  class="h-2.5 w-2.5" />
                  <Minus v-if="perm.isRevoke" class="h-2.5 w-2.5" />
                  {{ perm.short }}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Overrides actifs -->
        <Card v-if="detail.overrides.length" class="border-2">
          <CardHeader>
            <CardTitle class="text-base">Overrides actifs</CardTitle>
            <CardDescription>Modifications manuelles par rapport au rôle</CardDescription>
          </CardHeader>
          <CardContent class="space-y-2">
            <div
              v-for="o in detail.overrides"
              :key="o.permission"
              class="flex items-center justify-between rounded-lg border p-3"
            >
              <div class="flex items-center gap-3">
                <span :class="o.type === 'grant' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'"
                  class="px-2 py-0.5 rounded text-xs font-semibold uppercase">
                  {{ o.type === 'grant' ? '+ Grant' : '− Revoke' }}
                </span>
                <span class="font-mono text-sm">{{ o.permission }}</span>
                <span v-if="o.reason" class="text-xs text-muted-foreground italic">{{ o.reason }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xs text-muted-foreground">par {{ o.granted_by ?? 'système' }}</span>
                <Button v-if="can('user.assignFunction')" variant="ghost" size="icon" class="h-7 w-7 text-muted-foreground hover:text-destructive" @click="deleteOverride(o.permission)">
                  <X class="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Colonne droite : actions -->
      <div class="space-y-4">

        <!-- Grant -->
        <Card class="border-2">
          <CardHeader>
            <CardTitle class="text-sm flex items-center gap-2">
              <Plus class="h-4 w-4 text-green-600" />
              Accorder une permission
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <div class="space-y-1.5">
              <Label class="text-xs">Permission</Label>
              <Select v-model="grantForm.permission">
                <SelectTrigger class="h-8 text-xs">
                  <SelectValue placeholder="Choisir..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="p in availableToGrant" :key="p" :value="p" class="font-mono text-xs">
                    {{ p }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-1.5">
              <Label class="text-xs">Raison (optionnel)</Label>
              <Input v-model="grantForm.reason" placeholder="Justification..." class="h-8 text-xs" />
            </div>
            <Button size="sm" class="w-full" :disabled="!grantForm.permission || saving.grant" @click="submitGrant">
              <span v-if="saving.grant" class="flex items-center gap-2">
                <div class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              </span>
              <span v-else>Accorder</span>
            </Button>
          </CardContent>
        </Card>

        <!-- Revoke -->
        <Card class="border-2">
          <CardHeader>
            <CardTitle class="text-sm flex items-center gap-2">
              <Minus class="h-4 w-4 text-red-600" />
              Révoquer une permission
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <div class="space-y-1.5">
              <Label class="text-xs">Permission du rôle</Label>
              <Select v-model="revokeForm.permission">
                <SelectTrigger class="h-8 text-xs">
                  <SelectValue placeholder="Choisir..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="p in availableToRevoke" :key="p" :value="p" class="font-mono text-xs">
                    {{ p }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-1.5">
              <Label class="text-xs">Raison (optionnel)</Label>
              <Input v-model="revokeForm.reason" placeholder="Justification..." class="h-8 text-xs" />
            </div>
            <Button size="sm" variant="destructive" class="w-full" :disabled="!revokeForm.permission || saving.revoke" @click="submitRevoke">
              <span v-if="saving.revoke" class="flex items-center gap-2">
                <div class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              </span>
              <span v-else>Révoquer</span>
            </Button>
          </CardContent>
        </Card>

        <!-- Légende -->
        <div class="text-xs text-muted-foreground space-y-1.5 p-3 rounded-lg border bg-muted/40">
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded bg-secondary border border-border inline-block" />
            Permission du rôle
          </div>
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded bg-green-100 border border-green-400 inline-block" />
            Grant manuel
          </div>
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded bg-red-100 border border-red-400 inline-block" />
            Révoquée manuellement
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, Plus, Minus, X } from 'lucide-vue-next'
import { ref, computed, onMounted } from 'vue'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
  Button, Input, Label,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '#components'
import type { UserPermissionsDetail } from '~/types/api'
import { useToast } from '@/composables/useToast'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const userId = route.params.id as string
const { can } = usePermission()
const { apiFetch } = useApi()
const { success: showSuccess, error: showError } = useToast()

// ─────────────────────────────────────────────────────────────────────
// Toutes les permissions de l'app (pour les selects)
// ─────────────────────────────────────────────────────────────────────

const ALL_PERMISSIONS = [
  'flight.viewAny','flight.view','flight.create','flight.updateOwn','flight.updateAny',
  'flight.deleteOwn','flight.deleteAny','flight.validate','flight.export',
  'aircraft.viewAny','aircraft.view','aircraft.create','aircraft.update','aircraft.delete',
  'aircraftType.viewAny','aircraftType.view','aircraftType.create','aircraftType.update','aircraftType.delete',
  'operator.viewAny','operator.view','operator.create','operator.update','operator.delete',
  'report.view','report.export',
  'user.viewAny','user.create','user.update','user.delete','user.assignFunction',
  'permissionRequest.create','permissionRequest.manage',
  'files.import',
]

// ─────────────────────────────────────────────────────────────────────
// State
// ─────────────────────────────────────────────────────────────────────

const detail  = ref<UserPermissionsDetail | null>(null)
const loading = ref(true)
const saving  = ref({ grant: false, revoke: false })

const grantForm  = ref({ permission: '', reason: '' })
const revokeForm = ref({ permission: '', reason: '' })

// ─────────────────────────────────────────────────────────────────────
// Computed — permissions groupées par domaine
// ─────────────────────────────────────────────────────────────────────

const groupedPermissions = computed(() => {
  if (!detail.value) return {}

  const effective = new Set(detail.value.effective_permissions)
  const grants    = new Set(detail.value.overrides.filter(o => o.type === 'grant').map(o => o.permission))
  const revokes   = new Set(detail.value.overrides.filter(o => o.type === 'revoke').map(o => o.permission))

  // Toutes les permissions pertinentes = effectives + révoquées (pour les afficher barrées)
  const all = [...new Set([...effective, ...revokes])]

  const groups: Record<string, Array<{ name: string; short: string; isGrant: boolean; isRevoke: boolean }>> = {}

  for (const perm of all) {
    const [domain, action] = perm.split('.')
    if (!groups[domain]) groups[domain] = []
    groups[domain].push({
      name:     perm,
      short:    action ?? perm,
      isGrant:  grants.has(perm),
      isRevoke: revokes.has(perm),
    })
  }

  return groups
})

// Permissions non encore accordées (pour le select grant)
const availableToGrant = computed(() => {
  if (!detail.value) return []
  const effective = new Set(detail.value.effective_permissions)
  return ALL_PERMISSIONS.filter(p => !effective.has(p))
})

// Permissions actives qu'on peut révoquer (pour le select revoke)
const availableToRevoke = computed(() => {
  if (!detail.value) return []
  const alreadyRevoked = new Set(detail.value.overrides.filter(o => o.type === 'revoke').map(o => o.permission))
  return detail.value.role_permissions.filter(p => !alreadyRevoked.has(p))
})

// ─────────────────────────────────────────────────────────────────────
// API
// ─────────────────────────────────────────────────────────────────────

const fetchDetail = async () => {
  loading.value = true
  try {
    detail.value = await apiFetch<UserPermissionsDetail>(`/users/${userId}/permissions`)
  } catch {
    showError('Impossible de charger les permissions')
  } finally {
    loading.value = false
  }
}

const submitGrant = async () => {
  saving.value.grant = true
  try {
    await apiFetch(`/users/${userId}/permissions/grant`, {
      method: 'POST',
      body: { permission: grantForm.value.permission, reason: grantForm.value.reason || undefined },
    })
    showSuccess('Permission accordée')
    grantForm.value = { permission: '', reason: '' }
    await fetchDetail()
  } catch (e: any) {
    showError(e?.data?.message ?? 'Erreur')
  } finally {
    saving.value.grant = false
  }
}

const submitRevoke = async () => {
  saving.value.revoke = true
  try {
    await apiFetch(`/users/${userId}/permissions/revoke`, {
      method: 'POST',
      body: { permission: revokeForm.value.permission, reason: revokeForm.value.reason || undefined },
    })
    showSuccess('Permission révoquée')
    revokeForm.value = { permission: '', reason: '' }
    await fetchDetail()
  } catch (e: any) {
    showError(e?.data?.message ?? 'Erreur')
  } finally {
    saving.value.revoke = false
  }
}

const deleteOverride = async (permission: string) => {
  try {
    await apiFetch(`/users/${userId}/permissions/${permission}`, { method: 'DELETE' })
    showSuccess('Override supprimé')
    await fetchDetail()
  } catch (e: any) {
    showError(e?.data?.message ?? 'Erreur')
  }
}

// ─────────────────────────────────────────────────────────────────────
// Helpers visuels
// ─────────────────────────────────────────────────────────────────────

const roleLabel = (role?: string | null) => ({
  admin: 'Administrateur', manager: 'Manager', agent: 'Agent',
}[role ?? ''] ?? '—')

const roleClass = (role?: string | null) => ({
  admin:   'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  agent:   'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
}[role ?? ''] ?? 'bg-gray-100 text-gray-600')

// ─────────────────────────────────────────────────────────────────────
// Init
// ─────────────────────────────────────────────────────────────────────

onMounted(() => fetchDetail())
</script>
